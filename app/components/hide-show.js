import $ from 'jquery';
import callIfPresent from 'textup-frontend/utils/call-if-present';
import Component from '@ember/component';
import HasAppRoot from 'textup-frontend/mixins/component/has-app-root';
import HasEvents from 'textup-frontend/mixins/component/has-events';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import { distance } from 'textup-frontend/utils/coordinate';
import { isOrContainsElement } from 'textup-frontend/utils/element';
import { next, run, scheduleOnce } from '@ember/runloop';
import { tryInvoke } from '@ember/utils';

const TOUCH_TAP_MAX_DISTANCE_IN_PX = 20;

export default Component.extend(PropTypesMixin, HasAppRoot, HasEvents, {
  propTypes: Object.freeze({
    doRegister: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    focusOnOpenSelector: PropTypes.string,
    startOpen: PropTypes.bool,
    clickOutToClose: PropTypes.bool,
    ignoreCloseSelector: PropTypes.oneOfType([PropTypes.null, PropTypes.string]),
    focusOutToClose: PropTypes.bool,
    animate: PropTypes.bool,
    disabled: PropTypes.bool,
  }),
  getDefaultProps() {
    return {
      startOpen: false,
      clickOutToClose: false,
      ignoreCloseSelector: '.slideout-pane, .c-notification__container',
      focusOutToClose: false,
      animate: true,
      disabled: false,
    };
  },

  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
  },
  didInsertElement() {
    this._super(...arguments);
    if (this.get('startOpen')) {
      scheduleOnce('afterRender', this, this._open);
    }
    this._startCloseListeners();
  },
  willDestroyElement() {
    this._super(...arguments);
    this._stopCloseListeners();
  },

  // Internal properties
  // -------------------

  _publicAPI: computed(function() {
    return {
      isOpen: false,
      actions: {
        toggle: this._toggle.bind(this),
        open: this._open.bind(this),
        close: this._close.bind(this),
        // call bind instead of using an arrow function so we can access `arguments`
        closeThenCall: this._closeThenCall.bind(this),
      },
    };
  }),
  _touchCoordinates: computed(() => {
    return {};
  }),

  // Internal handlers
  // -----------------

  _toggle() {
    return this.get('_publicAPI.isOpen') ? this._close() : this._open();
  },
  _open() {
    return run(() => {
      return new RSVP.Promise(resolve => {
        if (this.get('_publicAPI.isOpen') || this.get('disabled')) {
          return resolve();
        }
        this.setProperties({ '_publicAPI.isOpen': true });
        // needs more a delay than 'afterRender' to ensure that initialization work
        // when opening the hide-show has completed
        next(this, this._afterOpen.bind(this, resolve));
      });
    });
  },
  _afterOpen(resolve) {
    const focusSelector = this.get('focusOnOpenSelector');
    if (focusSelector) {
      this.$(focusSelector).focus();
    }
    tryInvoke(this, 'onOpen');
    resolve();
  },

  _close() {
    return new RSVP.Promise(resolve => {
      if (!this.get('_publicAPI.isOpen') || this.get('disabled')) {
        return resolve();
      }
      this.setProperties({ '_publicAPI.isOpen': false });
      tryInvoke(this, 'onClose');
      resolve();
    });
  },
  _closeThenCall(action) {
    return this._close().then(() => callIfPresent(null, action, [...arguments].slice(1)));
  },
  // for target vs relatedTarget: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/relatedTarget
  _tryCloseOnFocusout({ relatedTarget }) {
    if (
      this.get('isDestroying') ||
      this.get('isDestroyed') ||
      !this.get('focusOutToClose') ||
      !relatedTarget
    ) {
      return;
    }
    const $el = this.$();
    // only trigger close when the related target IS NOT within this component. This condition is
    // fulfilled when the focus is actually leaving this element altogether
    if (!$.contains($el[0], relatedTarget)) {
      this._close();
    }
  },
  _tryCloseOnClick({ target }) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    const closeClickOut = this.get('clickOutToClose');
    if (!closeClickOut) {
      return;
    }
    const $root = this.get('_root'),
      $target = $(target),
      thisEl = this.element;
    // don't close if clicked inside body
    if (isOrContainsElement(thisEl, target)) {
      return;
    }
    // don't close if the clicked target is nonexistent
    if (!isOrContainsElement($root[0], target)) {
      return;
    }
    const ignoreCloseSelector = this.get('ignoreCloseSelector');
    if (!ignoreCloseSelector || $target.closest(ignoreCloseSelector).length === 0) {
      this._close();
    }
  },

  _startCloseListeners() {
    this.get('_root')
      .on(this._event('click'), this._tryCloseOnClick.bind(this))
      .on(this._event('touchstart'), this._handleTouchStart.bind(this))
      .on(this._event('touchend'), this._handleTouchEnd.bind(this));
    this.$().on(this._event('focusout'), this._tryCloseOnFocusout.bind(this));
  },
  _stopCloseListeners() {
    this.get('_root').off(this._event());
    this.$().off(this._event());
  },

  _handleTouchStart(event) {
    const touches = event.originalEvent.changedTouches,
      coords = this.get('_touchCoordinates');
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      coords[touch.identifier] = [touch.screenX, touch.screenY];
    }
  },
  _handleTouchEnd(event) {
    const touches = event.originalEvent.changedTouches,
      coords = this.get('_touchCoordinates');
    let shouldTryClose = false;
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i],
        oldCoords = coords[touch.identifier];
      if (!shouldTryClose && oldCoords) {
        shouldTryClose =
          distance(oldCoords, [touch.screenX, touch.screenY]) < TOUCH_TAP_MAX_DISTANCE_IN_PX;
      }
      delete coords[touch.identifier];
    }
    if (shouldTryClose) {
      this._tryCloseOnClick(event);
    }
  },
});
