import callIfPresent from '../utils/call-if-present';
import defaultIfAbsent from '../utils/default-if-absent';
import Ember from 'ember';

const { $, getOwner, isNone, computed, run: { scheduleOnce, later } } = Ember;

export default Ember.Component.extend({
  title: defaultIfAbsent(''),
  direction: defaultIfAbsent('left'),
  ignoreCloseSelectors: defaultIfAbsent(''),
  startOpen: defaultIfAbsent(true),
  clickOutToClose: defaultIfAbsent(true),
  focusDelay: defaultIfAbsent(500), // in ms
  focusSelector: defaultIfAbsent('.slideout-header'),
  // must explicitly include default header if has inverse
  includeDefaultHeader: defaultIfAbsent(false),
  // if true then calling close on the slideout has no effect
  // used to disable closing, for example when performing a longer process
  // that hasn't finished yet.
  forceKeepOpen: defaultIfAbsent(false),

  onOpen: null,
  doClose: null,

  classNames: 'slideout-pane',
  classNameBindings: ['directionClass', 'forceKeepOpen:force-keep-open', '_isOpen:is-open'],

  // Private properties
  // ------------------

  _isOpen: false,
  _isOpening: false,
  _$overlay: null,

  // Computed properties
  // -------------------

  publicAPI: computed('direction', '_isOpen', '_isOpening', function() {
    return {
      id: this.elementId,
      direction: this.get('direction'),
      isOpen: this.get('_isOpen'),
      isOpening: this.get('_isOpening'),
      actions: {
        open: this._open.bind(this),
        // can pass as many closures to execute subsequently as we like
        close: this._close.bind(this, true)
      }
    };
  }),
  directionClass: computed('direction', function() {
    return `slideout-pane-${this.get('direction')}`;
  }),
  _$appRoot: computed(function() {
    const rootSelector = Ember.testing
      ? '#ember-testing'
      : getOwner(this).lookup('application:main').rootElement;
    return $(rootSelector);
  }),
  _$el: computed(function() {
    return this.$();
  }),

  // Events
  // ------

  didInsertElement: function() {
    if (this.get('startOpen')) {
      scheduleOnce('afterRender', this, this._open);
    }
  },
  willDestroyElement: function() {
    this._super(...arguments);
    $(document).off(`.${this.elementId}`);
    this._removeOverlay();
  },

  actions: {
    close: function() {
      this._close(true);
    }
  },

  // Event handlers
  // --------------

  _handleClickOutToClose: function(event) {
    if (this.get('_isOpening') || !this.get('_isOpen')) {
      this.set('_isOpening', false);
      return;
    }
    const ignoreCloseSelectors = this.get('ignoreCloseSelectors'),
      $appRoot = this.get('_$appRoot'),
      $overlay = this.get('_$overlay'),
      $target = $(event.target),
      targetStillInDOM = $appRoot.find($target).length > 0;
    if (!targetStillInDOM) {
      return;
    }
    if ($target.is($overlay)) {
      this._close(false);
    } else if (
      !$target.closest(`#${this.elementId}`).length &&
      !$target.closest(ignoreCloseSelectors).length
    ) {
      this._close(false);
    }
  },

  // Opening and closing
  // -------------------

  _close: function(manualClose, ...then) {
    if (manualClose || this.get('forceKeepOpen') === false) {
      if (!(this.isDestroying || this.isDestroyed)) {
        this.get('_$el').addClass('is-closing');
        this.set('_isOpen', false);
        this.set('_isOpening', false);
        this._removeOverlay();
      }
      callIfPresent(this.get('doClose'), this.get('publicAPI'));
      then.forEach(callIfPresent);
    }
  },
  _open: function() {
    if (this.get('_isOpen') || this.get('_isOpening')) {
      return;
    }
    this.get('_$el').removeClass('is-closing');
    this.set('_isOpen', true);
    this.set('_isOpening', true);
    this._insertOverlay();
    callIfPresent(this.get('onOpen'), this.get('publicAPI'));
    // events
    if (this.get('clickOutToClose')) {
      const elId = this.elementId;
      $(document).on(`click.${elId}`, this._handleClickOutToClose.bind(this));
    }
    // focus on open
    later(
      this,
      function() {
        const $el = this.get('_$el');
        if ($el) {
          const focusObj = $el.find(this.get('focusSelector'));
          if (focusObj) {
            focusObj.focus();
          }
        }
      },
      this.get('focusDelay')
    );
  },

  // Overlay
  // -------

  _insertOverlay: function() {
    const $el = this.get('_$el');
    let $overlay = this.get('_$overlay');
    if (isNone($overlay)) {
      $overlay = this._build$Overlay();
      this.set('_$overlay', $overlay);
    }
    $el.after($overlay);
  },
  _removeOverlay: function() {
    const $overlay = this.get('_$overlay');
    if ($overlay) {
      $overlay.remove();
    }
  },
  _build$Overlay: function() {
    const directionClass = this.get('directionClass');
    return $(`<div class='slideout-overlay ${directionClass}'></div>`);
  }
});
