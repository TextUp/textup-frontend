import Ember from 'ember';
import callIfPresent from '../utils/call-if-present';
import defaultIfAbsent from '../utils/default-if-absent';
import { distance } from '../utils/coordinate';

const { Component, run, computed, $ } = Ember,
  MutObserver =
    window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

export default Component.extend({
  onOpen: null,
  onOpened: null, // after done opening
  onClose: null,
  onClosed: null, // after done closing
  onMouseDown: null,
  onKeyPress: null,
  doRegister: null,

  disabled: defaultIfAbsent(false),
  hideTriggerOnOpen: defaultIfAbsent(false),
  autoOpen: defaultIfAbsent(true),
  startOpen: defaultIfAbsent(false),
  clickOutToClose: defaultIfAbsent(true),
  focusOutClose: defaultIfAbsent(false),
  bodyClickClose: defaultIfAbsent(false),

  ignoreCloseSelectors: defaultIfAbsent('.slideout-pane, .c-notification__container'),
  bodyFocusOnOpenSelector: defaultIfAbsent(''),
  allowedTriggerSelectors: defaultIfAbsent(''),
  ignoreTriggerSelectors: defaultIfAbsent(''),

  // usually scroll is on window, but we contain everything within a
  // #container element with overflow-y: auto;
  scrollSelector: defaultIfAbsent('#container'),
  animation: defaultIfAbsent('slide'), // none | slide | fade
  openOn: defaultIfAbsent('click'), // click | hover

  floating: defaultIfAbsent(false),
  // floating body must not take up more than 75% of remaining space
  floatHeightMax: defaultIfAbsent(0.75),
  floatMode: defaultIfAbsent('document'), // document | offsetParent
  horizontal: defaultIfAbsent('auto'), // left | right | auto
  vertical: defaultIfAbsent('auto'), // top | bottom | auto
  throttleThreshold: defaultIfAbsent(60),

  role: defaultIfAbsent('button'),
  tabindex: defaultIfAbsent(0),
  classNames: 'hide-away',
  wormholeClass: 'hide-away-wormhole',

  _touchStartCoords: Ember.computed(() => Object.create(null)),
  _willFloatOver: false,

  // Computed properties
  // -------------------

  floatHeightThreshold: computed('floatHeightMax', function() {
    const threshold = parseFloat(this.get('floatHeightMax'));
    return isNaN(threshold) ? 0.75 : Math.min(Math.max(threshold, 0), 1);
  }),
  destination: computed(function() {
    return `${this.elementId}--wormhole`;
  }),
  tabIndex: computed('disabled', 'tabindex', function() {
    return this.get('disabled') || this.get('tabindex') === false ? null : this.get('tabindex');
  }),
  $appRoot: computed(function() {
    const rootSelector = Ember.testing
      ? '#ember-testing'
      : Ember.getOwner(this).lookup('application:main').rootElement;
    return Ember.$(rootSelector);
  }),
  $wormholeParent: computed('floatMode', function() {
    return this.get('floatMode') === 'offsetParent'
      ? this.$().offsetParent()
      : this.get('$appRoot');
  }),
  $trigger: computed(function() {
    return this.$('.hide-away-trigger');
  }),
  publicAPI: computed(function() {
    return {
      isOpen: this.get('startOpen'),
      actions: {
        open: this.open.bind(this),
        toggle: this.toggle.bind(this),
        close: this.close.bind(this)
      }
    };
  }),

  // Events
  // ------

  didInitAttrs: function() {
    this._super(...arguments);
    callIfPresent(this.get('doRegister'), this.get('publicAPI'));
  },
  didInsertElement: function() {
    this._super(...arguments);
    // inject wormhole depending on floating mode
    if (this.get('floating')) {
      const destination = this.get('destination'),
        wormholeClass = this.get('wormholeClass'),
        wormhole = `<div id='${destination}' class='${wormholeClass}'></div>`;
      this.set('_wormholeSelector', `#${destination}`);
      this.get('$wormholeParent').append(wormhole);
    }
    // setup listeners and starting state
    Ember.run.scheduleOnce('afterRender', this, function() {
      if (this.isDestroying || this.isDestroyed) {
        return;
      }
      this.addTriggerListeners();
      if (this.get('startOpen')) {
        this.doOpen(true);
      } else {
        this.doClose(true);
      }
    });
  },
  willDestroyElement: function() {
    this._super(...arguments);
    this.removeTriggerListeners();
    this.removeBodyListeners();
    if (this.get('_wormholeSelector')) {
      Ember.$(this.get('_wormholeSelector')).remove();
    }
  },

  // Listeners and handlers
  // ----------------------

  handleKeypress: function(event) {
    if (this.get('disabled') || this._shouldStopEvent(event)) {
      return false;
    }
    if (this._shouldIgnoreOnTrigger(event)) {
      return; // don't return false to allow default to happen
    }
    if (event.which === 27) {
      // escape key
      this.close(event);
    } else if (event.which === 13) {
      // enter
      this.toggle(event);
    }
  },
  handleMousedown: function(event) {
    Ember.run(() => {
      if (this._shouldStopEvent(event)) {
        return false;
      }
      // return nothing on disabled to allow mouse events such as
      // selecting text to still happen
      if (this.get('disabled') || this._shouldIgnoreOnTrigger(event)) {
        // subsequent click event is not fired so we trigger the click
        // event here for other components to know that a click was
        // trigger on this mousedown event. Also fire touchstart for
        // touch screen support
        $(event.target).trigger('click touchstart');
        return; // don't return false to allow default to happen
      }
      // stop text selection of trigger
      const $trigger = this.get('$trigger');
      if ($trigger) {
        $trigger.addClass('no-select').one('mouseup', this._resetTrigger.bind(this));
      }
      this.toggle(event);
    });
  },
  _shouldIgnoreOnTrigger: function(event) {
    const $target = Ember.$(event.target),
      ignore = this.get('ignoreTriggerSelectors'),
      allowed = this.get('allowedTriggerSelectors');
    const shouldIgnore = $target.is(ignore) || $target.closest(ignore).length;
    // if we specify specific selectors to allow, we will then
    // see if the triggered target matches one of these
    if (!shouldIgnore && Ember.isPresent(allowed)) {
      return !($target.is(allowed) || $target.closest(allowed).length);
    } else {
      return shouldIgnore;
    }
  },
  addTriggerListeners: function() {
    const $trigger = this.get('$trigger'),
      mouseDown = this.get('onMouseDown'),
      keyPress = this.get('onKeyPress');

    if (!$trigger) {
      return;
    }

    // hover actions
    if (this.get('openOn') === 'hover') {
      $trigger.on(`mouseenter.${this.elementId}`, this.open.bind(this));
    }
    // event hook must come before standard actions to allow for stopping
    // propagation if we don't want to trigger the standard actions
    if (mouseDown) {
      $trigger.on(`mousedown.${this.elementId}`, mouseDown);
    }
    if (keyPress) {
      $trigger.on(`keypress.${this.elementId}`, keyPress);
    }
    // standard actions
    if (this.get('autoOpen')) {
      $trigger
        .on(`mousedown.${this.elementId}`, this.handleMousedown.bind(this))
        .on(`keypress.${this.elementId}`, this.handleKeypress.bind(this));
    }
  },
  removeTriggerListeners: function() {
    const $trigger = this.get('$trigger');
    if ($trigger) {
      $trigger.off(`.${this.elementId}`);
    }
  },
  _addBodyListeners: function($body) {
    if (this.get('_bodyHasListeners') || this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this.set('_bodyHasListeners', true);

    const $el = this.$(),
      throttle = this.get('throttleThreshold'),
      scrollSelector = this.get('scrollSelector'),
      $appRoot = this.get('$appRoot'),
      doReposition = function() {
        Ember.run.throttle(this, this.positionBody, $body, true, throttle, true);
      }.bind(this);

    if (this.get('openOn') === 'hover') {
      $body.on(
        `mouseleave.${this.elementId}`,
        function(event) {
          this.close(event, true);
        }.bind(this)
      );
    }

    $body.on(
      `focusout.${this.elementId}`,
      function(event) {
        if (!this.get('focusOutClose')) {
          return;
        }
        const $related = event.relatedTarget && Ember.$(event.relatedTarget);
        // only trigger close when the related target IS NOT
        // within this component. This condition is fulfilled
        // when the focus is actually leaving this element altogether
        if (!$related || !$related.closest($el).length) {
          this.close(event, true);
        }
      }.bind(this)
    );

    $appRoot.on(`click.${this.elementId}`, this.checkAndDoCloseOnClick.bind(this, $body));
    // only trigger check to close on touch if touchstart follows touchend
    $appRoot
      .on(
        `touchstart.${this.elementId}`,
        function(event) {
          const touches = event.originalEvent.changedTouches,
            coords = this.get('_touchStartCoords');
          for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            coords[touch.identifier] = [touch.screenX, touch.screenY];
          }
        }.bind(this)
      )
      .on(
        `touchend.${this.elementId}`,
        function(event) {
          const touches = event.originalEvent.changedTouches,
            coords = this.get('_touchStartCoords');
          let shouldTryClose = false;
          for (let i = 0; i < touches.length; i++) {
            const touch = touches[i],
              oldCoords = coords[touch.identifier];
            if (!shouldTryClose && oldCoords) {
              const dist = distance(oldCoords, [touch.screenX, touch.screenY]);
              shouldTryClose = dist < 20;
            }
            delete coords[touch.identifier];
          }
          if (shouldTryClose) {
            this.checkAndDoCloseOnClick($body, event);
          }
        }.bind(this)
      );
    // Reposition on resize, scroll and orientation change
    $(window).on(`resize.${this.elementId} orientationchange.${this.elementId}`, doReposition);
    if (Ember.isPresent(scrollSelector)) {
      $(scrollSelector).on(`scroll.${this.elementId}`, doReposition);
      this.set('_scrollBinding', scrollSelector);
    }
    // also reposition if any DOM nodes are added or removed
    this._startObserveMutations($body, doReposition);
  },
  removeBodyListeners: function() {
    const $appRoot = this.get('$appRoot');
    $appRoot
      .off(`click.${this.elementId}`)
      .off(`touchstart.${this.elementId}`)
      .off(`touchend.${this.elementId}`);
    $(window).off(`.${this.elementId}`);
    const $body = this._findBody(),
      scrollSelector = this.get('_scrollBinding');
    if (Ember.isPresent($body[0])) {
      $body.off(`.${this.elementId}`);
      this._stopObserveMutations($body);
    }
    if (Ember.isPresent(scrollSelector)) {
      $(scrollSelector).off(`.${this.elementId}`);
    }
    this.set('_bodyHasListeners', false);
  },
  _startObserveMutations: function($body, doReposition) {
    if (MutObserver) {
      const observer = new MutObserver(
        function(mutations) {
          const mut = mutations[0];
          if (mut.addedNodes.length || mut.removedNodes.length) {
            doReposition();
          }
        }.bind(this)
      );
      observer.observe($body[0], {
        childList: true,
        subtree: true
      });
      this.set('_mutationObserver', observer);
    } else {
      $body
        .on(`DOMNodeInserted.${this.elementId}`, doReposition)
        .on(`DOMNodeRemoved.${this.elementId}`, doReposition);
    }
  },
  _stopObserveMutations: function($body) {
    const observer = this.get('_mutationObserver');
    if (observer) {
      observer.disconnect();
      this.set('_mutationObserver', null);
    } else {
      $body.off(`DOMNodeInserted.${this.elementId}`).off(`DOMNodeRemoved.${this.elementId}`);
    }
  },

  // Open/close
  // ----------

  toggle: function(event, skipFocus = false, callback = undefined) {
    if (this.get('publicAPI.isOpen')) {
      this.close(event, skipFocus, callback);
    } else {
      this.open(event, skipFocus, callback);
    }
  },
  open: function(event, skipFocus = false, callback = undefined) {
    if (
      this.get('disabled') ||
      this.get('publicAPI.isOpen') ||
      (event && this._shouldStopEvent(event)) ||
      this.isDestroying ||
      this.isDestroyed
    ) {
      return;
    }

    this.doOpen(skipFocus, callback);
  },
  close: function(event, skipFocus = false, callback = undefined) {
    if (
      this.get('disabled') ||
      !this.get('publicAPI.isOpen') ||
      (event && this._shouldStopEvent(event)) ||
      this.isDestroying ||
      this.isDestroyed
    ) {
      return;
    }
    this.doClose(skipFocus, callback);
  },

  // Open
  // ----

  doOpen: function(skipFocus = false, callback = undefined) {
    run.cancel(this.get('_closeTimer'));
    this.setProperties({
      _closeTimer: null,
      _isOpen: true
    });
    const openTimer = run.scheduleOnce('afterRender', this, function() {
      callIfPresent(this.get('onOpen'));
      // need to wait until after render for body to appear
      let triggerOpenPromise = null;
      if (this.get('hideTriggerOnOpen')) {
        const $trigger = this.get('$trigger');
        if ($trigger) {
          triggerOpenPromise = $trigger.hide().promise();
        }
      }
      const $body = this._findBody(),
        after = this._afterOpen.bind(this, $body, skipFocus, callback);
      let openAction = null;
      this.positionBody($body);
      $body.css('visibility', 'visible').hide();
      if (this.get('animation') === 'fade') {
        openAction = () => {
          Ember.run(() => {
            $body
              .fadeIn('fast')
              .promise()
              .done(after);
          });
        };
      } else if (this.get('animation') === 'slide') {
        openAction = () => {
          Ember.run(() => {
            $body
              .slideDown()
              .promise()
              .done(after);
          });
        };
      } else {
        // need a 1ms duration to allow body element to injected first
        // this is equivalent to wrapping in run.next call
        openAction = () => {
          Ember.run(() => {
            $body
              .show(1)
              .promise()
              .done(after);
          });
        };
      }
      if (triggerOpenPromise) {
        triggerOpenPromise.then(openAction).done(this._resetTrigger.bind(this));
      } else {
        openAction();
      }
    });
    this.set('_openTimer', openTimer);
  },
  _afterOpen: function($body, skipFocus, callback) {
    Ember.run(() => {
      if (this.isDestroying || this.isDestroyed) {
        return;
      }
      this.set('publicAPI.isOpen', true);
      callIfPresent(this.get('onOpened'));
      callIfPresent(callback);

      const bodyTimer = run.scheduleOnce('afterRender', this, this._addBodyListeners, $body);
      this.set('_bodyTimer', bodyTimer);
      if (!skipFocus) {
        const focusSelector = this.get('bodyFocusOnOpenSelector'),
          $bodyFocus = focusSelector ? this.$(focusSelector) : null;
        if ($bodyFocus && $bodyFocus.length) {
          $bodyFocus.focus();
        } else if ($body[0].tabIndex > -1) {
          $body.focus();
        }
      }
    });
  },

  // Close
  // -----

  doClose: function(skipFocus = false, callback = undefined) {
    run.cancel(this.get('_openTimer'));
    run.cancel(this.get('_bodyTimer'));
    this.removeBodyListeners();
    this.setProperties({
      _bodyTimer: null,
      _openTimer: null
    });
    const $body = this._findBody(),
      $trigger = this.get('$trigger'),
      animation = this.get('animation'),
      after = this._afterClose.bind(this, $body, skipFocus, callback);
    if (Ember.isNone($body[0]) || !$trigger) {
      return;
    }
    callIfPresent(this.get('onClose'));
    if (this.get('hideTriggerOnOpen')) {
      if (animation === 'fade') {
        $body
          .hide()
          .promise()
          .then(() => {
            $trigger
              .fadeIn('fast')
              .promise()
              .done(after);
          });
      } else if (animation === 'slide') {
        $body.slideUp(() => {
          $trigger
            .slideDown()
            .promise()
            .done(after);
        });
      } else {
        // calling trigger in promise.then of body.hide
        // does not show the trigger for some reason
        $body.hide();
        $trigger
          .show()
          .promise()
          .done(after);
      }
    } else if (animation === 'slide') {
      $body
        .slideUp()
        .promise()
        .done(after);
    } else if (animation === 'fade') {
      $body
        .fadeOut()
        .promise()
        .done(after);
    } else {
      $body
        .hide()
        .promise()
        .done(after);
    }
  },
  _afterClose: function($body, skipFocus, callback) {
    Ember.run(() => {
      if (this.isDestroying || this.isDestroyed) {
        return;
      }
      this.set('_isOpen', false);
      const closeTimer = run.scheduleOnce('afterRender', this, function() {
        this.set('publicAPI.isOpen', false);
        callIfPresent(this.get('onClosed'));
        callIfPresent(callback);

        const $trigger = this.get('$trigger');
        if (!skipFocus && $trigger && $trigger[0].tabIndex > -1) {
          $trigger.focus();
        }
      });
      this.set('_closeTimer', closeTimer);
    });
  },

  // Positioning
  // -----------

  positionBody: function($body, scheduleLast = false) {
    if (!this.get('floating')) {
      return;
    }
    const positionInfo = this._getPositionInfo($body);
    this._positionVertical($body, positionInfo);
    this._positionHorizontal($body, positionInfo);
    if (scheduleLast) {
      Ember.run.cancel(this.get('_repositionTimer'));
      const later = this.get('throttleThreshold'),
        doLast = Ember.run.later(this, this.positionBody, $body, later);
      this.set('_repositionTimer', doLast);
    }
  },
  _positionVertical: function($body, { parentHeight, element: elBox, body: bodyBox }) {
    const vSetting = this.get('vertical'),
      // relative to bottom, keeping in mind that we consider
      // the dropdown body to be upside-down to allow for 'sliding up'
      offsetFromTopRelToBottom = parentHeight - elBox.top,
      // relative to top, keeping in mind that we consider
      // the dropdown body to be rightside-up to allow for 'sliding down'
      offsetFromTopRelToTop = elBox.top + elBox.height;
    if (vSetting === 'top') {
      this._doPositionVertical($body, 'top', offsetFromTopRelToBottom, parentHeight);
    } else if (vSetting === 'bottom') {
      this._doPositionVertical($body, 'bottom', offsetFromTopRelToTop, parentHeight);
    } else {
      // auto
      const spaceIfTop = elBox.top,
        spaceIfBottom = parentHeight - elBox.top - elBox.height;
      if (spaceIfBottom > bodyBox.height) {
        this._doPositionVertical($body, 'bottom', offsetFromTopRelToTop, parentHeight);
      } else if (spaceIfTop > bodyBox.heightb) {
        this._doPositionVertical($body, 'top', offsetFromTopRelToBottom, parentHeight);
      } else if (spaceIfBottom > spaceIfTop) {
        this._doPositionVertical($body, 'bottom', offsetFromTopRelToTop, parentHeight);
      } else {
        this._doPositionVertical($body, 'top', offsetFromTopRelToBottom, parentHeight);
      }
    }
  },
  _doPositionVertical: function($body, where, amount, parentHeight) {
    // determine if will float over the edge of the screen
    const threshold = this.get('floatHeightThreshold'),
      adjustedHeightRemaining = (parentHeight - amount) * threshold,
      bodyHeight = $body.height();
    if (bodyHeight > adjustedHeightRemaining) {
      this.set('_willFloatOver', true);
      $body.css('max-height', `${adjustedHeightRemaining}px`);
    } else {
      this.set('_willFloatOver', false);
      $body.css('max-height', '');
    }
    // actually position vertically
    if (where === 'top') {
      // relative to bottom to allow for slideDown to actually slide up
      $body.css({
        top: 'auto',
        bottom: amount
      });
      this.set('_bodyVerticalClass', 'hide-away-body--top');
    } else {
      $body.css({
        top: amount,
        bottom: 'auto'
      });
      this.set('_bodyVerticalClass', 'hide-away-body--bottom');
    }
  },
  _positionHorizontal: function($body, { parentWidth, element: elBox, body: bodyBox }) {
    const hSetting = this.get('horizontal'),
      onLeft = elBox.left,
      onRight = elBox.left + elBox.width - bodyBox.width;

    if (hSetting === 'left') {
      this._doPositionHorizontal($body, 'left', onLeft);
    } else if (hSetting === 'right') {
      this._doPositionHorizontal($body, 'right', onRight);
    } else {
      const spaceIfLeft = parentWidth - elBox.left,
        spaceIfRight = elBox.left + elBox.width;

      if (spaceIfRight > bodyBox.width) {
        this._doPositionHorizontal($body, 'right', onRight);
      } else if (spaceIfLeft > bodyBox.width) {
        this._doPositionHorizontal($body, 'left', onLeft);
      } else if (spaceIfRight > spaceIfLeft) {
        this._doPositionHorizontal($body, 'right', onRight);
      } else {
        this._doPositionHorizontal($body, 'left', onLeft);
      }
    }
  },
  _doPositionHorizontal: function($body, where, amount) {
    const position = where === 'left' ? 'left' : 'right';
    $body.css({
      left: amount,
      right: 'auto'
    });
    this.set('_bodyHorizontalClass', `hide-away-body--${position}`);
  },

  // Helpers
  // -------

  _resetTrigger: function() {
    const $trigger = this.get('$trigger');
    if ($trigger) {
      $trigger.removeClass('no-select');
    }
  },
  _getPositionInfo: function($body) {
    // bounding client rectangle always relative to the viewport!
    const wormholeParent = this.get('$wormholeParent')[0],
      $el = this.$(),
      elBox = $el[0].getBoundingClientRect(),
      bodyBox = $body[0].getBoundingClientRect(),
      positionInfo = {
        parentHeight: wormholeParent.clientHeight,
        parentWidth: wormholeParent.clientWidth,
        element: {
          height: elBox.height,
          width: elBox.width,
          top: elBox.top,
          left: elBox.left
        },
        body: {
          height: bodyBox.height,
          width: bodyBox.width
        }
      };
    if (this.get('floatMode') === 'offsetParent') {
      const elPosition = $el.position();
      positionInfo.element.top = elPosition.top;
      positionInfo.element.left = elPosition.left;
    }
    return positionInfo;
  },
  _findBody: function() {
    const $parent = this.get('floating') ? this.get('$appRoot') : this.$();
    return $parent.find(`.hide-away-body.${this.elementId}`);
  },
  checkAndDoCloseOnClick: function($body, event) {
    const $appRoot = this.get('$appRoot'),
      $target = Ember.$(event.target),
      targetStillInDOM = $appRoot.is($target) || $appRoot.find($target).length > 0;

    if (!targetStillInDOM) {
      return;
    }
    const ignoreCloseSelectors = this.get('ignoreCloseSelectors'),
      shouldIgnore = $target.closest(ignoreCloseSelectors).length,
      isOutside = !$target.closest(this.$()).length,
      isInBody = !!$body.find($target).length,
      closeClickedOutside = this.get('clickOutToClose') && isOutside,
      closeClickedInBody = this.get('bodyClickClose') && isInBody;

    if (shouldIgnore) {
      return;
    }
    if (this.get('floating')) {
      // for when floating
      if ((closeClickedOutside && !isInBody) || closeClickedInBody) {
        this.close(event, true);
      }
    } else {
      // for all other cases
      if (closeClickedOutside || closeClickedInBody) {
        this.close(event, true);
      }
    }
  },
  _shouldStopEvent: function(event) {
    return callIfPresent(event.isImmediatePropagationStopped);
  }
});
