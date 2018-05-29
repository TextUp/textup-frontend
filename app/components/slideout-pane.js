import callIfPresent from '../utils/call-if-present';
import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { $, getOwner, isNone, computed, run } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    doClose: PropTypes.func.isRequired,

    headerComponent: PropTypes.string,
    headerProps: PropTypes.object,
    footerComponent: PropTypes.string,
    footerProps: PropTypes.object,

    direction: PropTypes.string,
    ignoreCloseSelectors: PropTypes.string,
    startOpen: PropTypes.bool,
    clickOutToClose: PropTypes.bool,
    focusDelay: PropTypes.number,
    focusSelector: PropTypes.string,
    // if true then calling close on the slideout has no effect used to disable closing, for
    // example when performing a longer process that hasn't finished yet.
    forceKeepOpen: PropTypes.bool,
    onOpen: PropTypes.func
  },
  getDefaultProps() {
    return {
      headerComponent: 'slideout-pane/title',
      headerProps: {},
      footerComponent: '',
      footerProps: {},
      direction: this.get('constants.SLIDEOUT.DIRECTION.LEFT'),
      ignoreCloseSelectors: this.get('constants.SLIDEOUT.DEFAULT_IGNORE_CLOSE_SELECTOR'),
      startOpen: true,
      clickOutToClose: true,
      focusDelay: 500, // in ms
      focusSelector: '',
      forceKeepOpen: false
    };
  },

  classNames: 'slideout-pane textup-container textup-container--direction-vertical',
  classNameBindings: [
    '_directionClass',
    'forceKeepOpen:slideout-pane--keep-open',
    '_isOpen:slideout-pane--open'
  ],

  // Private properties
  // ------------------

  _isOpen: false,
  _$overlay: null,

  // Computed properties
  // -------------------

  publicAPI: computed('direction', '_isOpen', function() {
    return {
      id: this.elementId,
      direction: this.get('direction'),
      isOpen: this.get('_isOpen'),
      actions: {
        open: this._open.bind(this),
        // can pass as many closures to execute subsequently as we like
        close: this._close.bind(this, true)
      }
    };
  }),
  _directionClass: computed('direction', function() {
    return `slideout-pane--direction-${this.get('direction')}`;
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

  didInsertElement() {
    if (this.get('startOpen')) {
      run.scheduleOnce('afterRender', this, this._open);
    }
  },
  willDestroyElement() {
    this._super(...arguments);
    $(document).off(`.${this.elementId}`);
    this._removeOverlay();
  },

  actions: {
    forceClose() {
      this._close(true);
    }
  },

  // Event handlers
  // --------------

  _handleClickOutToClose(event) {
    if (!this.get('_isOpen')) {
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

  _close(forceClose, ...then) {
    if (forceClose || this.get('forceKeepOpen') !== true) {
      if (!(this.isDestroying || this.isDestroyed)) {
        this.set('_isOpen', false);
        this._removeOverlay();
      }
      callIfPresent(this.get('doClose'), this.get('publicAPI'));
      then.forEach(callIfPresent);
    }
  },
  _open() {
    if (this.get('_isOpen')) {
      return;
    }
    this.set('_isOpen', true);
    this._insertOverlay();
    callIfPresent(this.get('onOpen'), this.get('publicAPI'));
    // events
    run.next(() => {
      if (this.get('clickOutToClose')) {
        const elId = this.elementId;
        $(document).on(`click.${elId}`, this._handleClickOutToClose.bind(this));
      }
    });
    // focus on open
    run.later(
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

  _insertOverlay() {
    const $el = this.get('_$el');
    let $overlay = this.get('_$overlay');
    if (isNone($overlay)) {
      $overlay = this._build$Overlay();
      this.set('_$overlay', $overlay);
    }
    $el.after($overlay);
  },
  _removeOverlay() {
    const $overlay = this.get('_$overlay');
    if ($overlay) {
      $overlay.remove();
    }
  },
  _build$Overlay() {
    return $(`<div class='slideout-pane__overlay'></div>`);
  }
});
