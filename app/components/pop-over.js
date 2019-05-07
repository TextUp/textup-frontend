import BoundUtils from 'textup-frontend/utils/bounds';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import HasEvents from 'textup-frontend/mixins/component/has-events';
import HasWormhole from 'textup-frontend/mixins/component/has-wormhole';
import MutationObserver from 'npm:mutation-observer';
import PlatformUtils from 'textup-frontend/utils/platform';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, RSVP, run, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, HasWormhole, HasEvents, {
  propTypes: {
    doRegister: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    onReposition: PropTypes.func,
    bodyClickWillClose: PropTypes.bool,
    position: PropTypes.oneOfType([PropTypes.null, PropTypes.string]),
  },
  getDefaultProps() {
    return { bodyClickWillClose: true };
  },
  classNames: ['pop-over'],

  init() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },
  didInsertElement() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', this, this._attachListeners);
  },
  // only do this on subsequent render this pop-over happens to be open
  didUpdateAttrs() {
    this._super(...arguments);
    const position = this.get('position');
    if (position !== this.get('_previousPosition')) {
      this._reposition();
    }
    this.set('_previousPosition', position);
  },
  willDestroyElement() {
    this._super(...arguments);
    this._removeListeners();
  },

  // Internal properties
  // -------------------

  _elementToWormhole: computed(function() {
    return this.$('.pop-over__body');
  }),
  _bodyContents: computed('_elementToWormhole', function() {
    return this.get('_elementToWormhole').find('.pop-over__body__contents');
  }),
  _isOpening: false, // for intermediate transition state where we are adjusting position
  _publicAPI: computed(function() {
    return {
      isOpen: false,
      actions: {
        open: this._open.bind(this),
        close: this._close.bind(this),
        toggle: this._toggle.bind(this),
        reposition: this._reposition.bind(this),
      },
    };
  }),
  _previousPosition: null,
  _bodyPositionTop: null,
  _bodyAlignLeft: null,
  _bodyFloatStyles: null,
  _safeBodyFloatStyles: computed('_bodyFloatStyles', function() {
    const stylesArray = this.get('_bodyFloatStyles');
    if (stylesArray) {
      return Ember.String.htmlSafe(stylesArray.join(';'));
    }
  }),
  _bodyDimesionStyles: null,
  _safeBodyDimensionStyles: computed('_bodyDimesionStyles', function() {
    const stylesArray = this.get('_bodyDimesionStyles');
    if (stylesArray) {
      return Ember.String.htmlSafe(stylesArray.join(';'));
    }
  }),
  _mutationObserver: null,
  _openCounter: 0, // to identify the latest open event to actually handle
  _closeCounter: 0, // to identify the latest open event to actually handle

  // Internal handlers
  // -----------------

  _toggle() {
    return this.get('_publicAPI.isOpen') ? this._close() : this._open();
  },
  _open() {
    return new RSVP.Promise((resolve, reject) => {
      if (this.get('_publicAPI.isOpen')) {
        return resolve();
      }
      const counter = this.get('_openCounter') + 1;
      run.later(this._finishOpening.bind(this, counter, resolve, reject), 10);
      // need to allow the body to appear in the DOM before we can adjust its position
      run(() => this.setProperties({ _isOpening: true, _openCounter: counter }));
    });
  },
  _finishOpening(counter, resolve, reject) {
    if (
      counter !== this.get('_openCounter') ||
      this.get('isDestroying') ||
      this.get('isDestroyed')
    ) {
      return resolve();
    }
    this._adjustPosition().then(() => {
      const bodyContents = this.get('_bodyContents');
      if (bodyContents && bodyContents.length) {
        run.scheduleOnce('afterRender', () => bodyContents.focus());
      }
      this.setProperties({ _isOpening: false, '_publicAPI.isOpen': true });
      tryInvoke(this, 'onOpen');
      resolve();
    }, reject);
  },

  _tryCloseOnBody() {
    if (this.get('bodyClickWillClose')) {
      if (PlatformUtils.isIOS() || PlatformUtils.isAndroid()) {
        // on iOS event order is different so wait to allow action to happen before closing
        run.later(this, this._close, 400);
      } else {
        // allow action to happen first before removing the floating style on the pop-over
        run.next(this, this._close);
      }
    }
  },
  _close() {
    return new RSVP.Promise(resolve => {
      if (!this.get('_publicAPI.isOpen')) {
        return resolve();
      }
      // so that we don't trigger the _open if we are clicking right on top of the trigger
      // but actually closing because of the overlay, not the trigger
      const counter = this.get('_closeCounter') + 1;
      run.later(this._finishClosing.bind(this, counter, resolve), 500);
      run.join(() =>
        this.setProperties({
          _isClosing: true, // intermediate state for closing animation
          _bodyPositionTop: null,
          _bodyAlignLeft: null,
          _bodyFloatStyles: null,
          _bodyDimesionStyles: null,
          _closeCounter: counter,
        })
      );
    });
  },
  _finishClosing(counter, resolve) {
    if (
      counter !== this.get('_closeCounter') ||
      this.get('isDestroying') ||
      this.get('isDestroyed')
    ) {
      return resolve();
    }
    this.setProperties({ _isClosing: false, '_publicAPI.isOpen': false });
    tryInvoke(this, 'onClose');
    resolve();
  },

  _reposition() {
    return new RSVP.Promise((resolve, reject) => {
      if (!this.get('_publicAPI.isOpen')) {
        return resolve();
      }
      this._adjustPosition().then(() => {
        tryInvoke(this, 'onReposition');
        resolve();
      }, reject);
    });
  },
  _adjustPosition() {
    return new RSVP.Promise(resolve => {
      const triggerEl = this.element,
        bodyEl = this.get('_bodyContents')[0],
        isTop = this._determineIsTop(),
        alignLeft = BoundUtils.shouldAlignToLeftEdge(triggerEl),
        floatStyles = BoundUtils.buildFloatingStyles(isTop, alignLeft, triggerEl, bodyEl),
        dimensionStyles = BoundUtils.buildDimensionStyles(isTop, alignLeft, triggerEl, bodyEl);

      run(() => {
        this.setProperties({
          _bodyPositionTop: isTop,
          _bodyAlignLeft: alignLeft,
          _bodyFloatStyles: floatStyles,
          _bodyDimesionStyles: dimensionStyles,
        });
      });
      resolve();
    });
  },
  _determineIsTop() {
    const position = this.get('position');
    if (position === Constants.POP_OVER.POSITION.TOP) {
      return true;
    } else if (position === Constants.POP_OVER.POSITION.BOTTOM) {
      return false;
    } else {
      return BoundUtils.hasMoreViewportSpaceOnTop(this.element);
    }
  },

  _attachListeners() {
    Ember.$(window)
      .on(this._event('resize'), this._repositionOnChange.bind(this))
      .on(this._event('orientationchange'), this._repositionOnChange.bind(this));
    const bodyContents = this.get('_bodyContents')[0],
      observer = new MutationObserver(this._repositionOnChange.bind(this));
    observer.observe(bodyContents, { childList: true, subtree: true });
    this.set('_mutationObserver', observer);
  },
  _removeListeners() {
    Ember.$(window).off(this._event());
    const observer = this.get('_mutationObserver');
    if (observer) {
      observer.disconnect();
      this.set('_mutationObserver', null);
    }
  },
  _repositionOnChange() {
    run.debounce(this, this._reposition, 500);
  },
});
