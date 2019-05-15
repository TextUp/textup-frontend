import ArrayUtils from 'textup-frontend/utils/array';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import HasAppRoot from 'textup-frontend/mixins/component/has-app-root';
import HasEvents from 'textup-frontend/mixins/component/has-events';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { $, isNone, computed, run, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, HasAppRoot, HasEvents, {
  propTypes: {
    onClose: PropTypes.func.isRequired,
    doRegister: PropTypes.func,
    headerComponent: PropTypes.EmberComponent,
    footerComponent: PropTypes.EmberComponent,

    bodyClass: PropTypes.string,
    direction: PropTypes.oneOf(Object.values(Constants.SLIDEOUT.DIRECTION)),
    ignoreCloseSelectors: PropTypes.string,
    clickOutToClose: PropTypes.bool,
    focusDelay: PropTypes.number,
    focusSelector: PropTypes.string,
    // if true then calling close on the slideout has no effect used to disable closing, for
    // example when performing a longer process that hasn't finished yet.
    forceKeepOpen: PropTypes.bool,
    onOpen: PropTypes.func,
  },
  getDefaultProps() {
    return {
      direction: Constants.SLIDEOUT.DIRECTION.LEFT,
      ignoreCloseSelectors: Constants.SLIDEOUT.DEFAULT_IGNORE_CLOSE_SELECTOR,
      bodyClass: '',
      clickOutToClose: true,
      focusDelay: 500, // in ms
      focusSelector: '.slideout-pane__body',
      forceKeepOpen: false,
    };
  },

  classNames: 'slideout-pane flex flex--direction-vertical',
  classNameBindings: [
    '_directionClass',
    'forceKeepOpen:slideout-pane--keep-open',
    '_publicAPI.isOpen:slideout-pane--open',
  ],

  init() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
  },
  didInsertElement() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', this, this._open);
  },
  willDestroyElement() {
    this._super(...arguments);
    $(document).off(this._event());
    this._removeOverlay();
  },

  // Internal properties
  // -------------------

  _$overlay: null,
  _publicAPI: computed(function() {
    return {
      id: this.get('elementId'),
      isOpen: false,
      actions: {
        close: this._close.bind(this, true), // can pass closures to execute subsequently
      },
    };
  }),
  _directionClass: computed('direction', function() {
    return `slideout-pane--direction-${this.get('direction')}`;
  }),

  // Internal handlers
  // -----------------

  _handleClickOutToClose({ target }) {
    if (!this.get('_publicAPI.isOpen') || !this.get('clickOutToClose')) {
      return;
    }
    const $target = $(target);
    if (this._targetIsInDOM($target)) {
      if (this._targetIsOverlay($target) || this._targetIsNotChildOrIgnored($target)) {
        this._close(false);
      }
    }
  },
  _targetIsInDOM($target) {
    return this.get('_root').find($target).length > 0;
  },
  _targetIsOverlay($target) {
    return $target.is(this.get('_$overlay'));
  },
  _targetIsNotChildOrIgnored($target) {
    return (
      !$target.closest(`#${this.get('elementId')}`).length &&
      !$target.closest(this.get('ignoreCloseSelectors')).length
    );
  },

  _close(forceClose, ...thens) {
    run.join(() => {
      if (this.get('isDestroying') || this.get('isDestroyed')) {
        return;
      }
      if (forceClose || this.get('forceKeepOpen') !== true) {
        this.set('_publicAPI.isOpen', false);
        this._removeOverlay();
        tryInvoke(this, 'onClose', [this.get('_publicAPI')]);
        ArrayUtils.tryCallAll(thens);
      }
    });
  },
  _open() {
    run.join(() => {
      if (this.get('isDestroying') || this.get('isDestroyed') || this.get('_publicAPI.isOpen')) {
        return;
      }
      this.set('_publicAPI.isOpen', true);
      this._insertOverlay();
      tryInvoke(this, 'onOpen', [this.get('_publicAPI')]);
      // attach click handler later on so we don't catch the click that opens up this slideout
      run.next(() => $(document).on(this._event('click'), this._handleClickOutToClose.bind(this)));
      run.later(this, this._focusAfterOpen, this.get('focusDelay'));
    });
  },
  _focusAfterOpen() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    const focusObj = this.$().find(this.get('focusSelector'));
    if (focusObj) {
      focusObj.focus();
    }
  },

  _insertOverlay() {
    let $overlay = this.get('_$overlay');
    if (isNone($overlay)) {
      $overlay = this._build$Overlay();
      this.set('_$overlay', $overlay);
    }
    this.$().after($overlay);
  },
  _removeOverlay() {
    const $overlay = this.get('_$overlay');
    if ($overlay) {
      $overlay.remove();
    }
  },
  _build$Overlay() {
    return $(`<div class='slideout-pane__overlay'></div>`);
  },
});
