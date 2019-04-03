import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import HasEvents from 'textup-frontend/mixins/component/has-events';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, tryInvoke, run, RSVP } = Ember;

export default Ember.Component.extend(PropTypesMixin, HasEvents, {
  propTypes: {
    direction: PropTypes.oneOf(Object.values(Constants.INFINITE_SCROLL.DIRECTION)),
    doRegister: PropTypes.func,
    onNearEnd: PropTypes.func,
    disabled: PropTypes.bool,
    contentClass: PropTypes.string,
  },
  getDefaultProps() {
    return {
      direction: Constants.INFINITE_SCROLL.DIRECTION.DOWN,
      disabled: false,
      contentClass: '',
    };
  },
  classNames: 'infinite-scroll__scroll-container',
  classNameBindings: 'disabled:infinite-scroll__scroll-container--disabled',

  didInitAttrs() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },
  didInsertElement() {
    this._super(...arguments);
    // Cannot add scroll event to the `customEvents` listened for by Ember's EventDispatcher because
    // the scroll event doesn't bubble, see https://github.com/emberjs/ember.js/issues/9753
    this.$().on(this._event('scroll'), this._scheduleOnScroll.bind(this));
    // this must be scheduled or else we enter into a rendering engine invalidation infinite loop
    run.scheduleOnce('afterRender', () => {
      this._scheduleResetPosition().then(() => this._storeUserOffsetAndCheckNearEnd());
    });
  },
  willDestroyElement() {
    this._super(...arguments);
    this.$().off(this._event());
  },

  // Internal properties
  // -------------------

  _publicAPI: computed(function() {
    return {
      isAtStart: false,
      actions: {
        checkNearEnd: this._scheduleCheckOffsetAndNearEnd.bind(this),
        resetPosition: this._scheduleResetPosition.bind(this),
        restoreUserPosition: this._scheduleRestoreUserPosition.bind(this),
      },
    };
  }),
  _userOffsetFromInitial: null,
  _isDown: computed.equal('direction', Constants.INFINITE_SCROLL.DIRECTION.DOWN),
  _isUp: computed.equal('direction', Constants.INFINITE_SCROLL.DIRECTION.UP),
  _$content: computed(function() {
    return this.$('.infinite-scroll__scroll-container__content');
  }),

  // Internal handlers
  // -----------------

  _scheduleOnScroll() {
    run.throttle(this, this._onScroll, ...arguments, 500, false);
  },
  _onScroll() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    run.scheduleOnce('afterRender', this, this._storeUserOffsetAndCheckNearEnd);
  },

  _scheduleResetPosition(shouldAnimate = false) {
    return new RSVP.Promise(resolve => {
      run.join(() =>
        run.scheduleOnce('render', this, this._scrollToOffset, resolve, 0, shouldAnimate)
      );
    });
  },
  _scheduleRestoreUserPosition(shouldAnimate = false) {
    return new RSVP.Promise(resolve => {
      run.join(() => {
        const offset = this.get('_userOffsetFromInitial');
        run.scheduleOnce('render', this, this._scrollToOffset, resolve, offset, shouldAnimate);
      });
    });
  },
  _scrollToOffset(resolve, offset, shouldAnimate) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return resolve();
    }
    const $el = this.$(),
      scrollTop = this._invertValueIfIsUp(offset);
    if (shouldAnimate) {
      $el.animate({ scrollTop }, { duration: 'fast', complete: resolve });
    } else {
      // scroll event handler will handle state updates
      $el.scrollTop(scrollTop);
      resolve();
    }
  },

  _scheduleCheckOffsetAndNearEnd() {
    run.join(() => run.scheduleOnce('afterRender', this, this._storeUserOffsetAndCheckNearEnd));
  },
  _storeUserOffsetAndCheckNearEnd() {
    run.join(() => {
      if (this.get('isDestroying') || this.get('isDestroyed')) {
        return;
      }
      const hasOverflow = this._hasOverflow(),
        userOffset = hasOverflow ? this._invertValueIfIsUp(this.$().scrollTop()) : 0;
      this.set('_userOffsetFromInitial', userOffset);
      this.set('_publicAPI.isAtStart', this._startingFromOffset(userOffset) < 50);
      if (!hasOverflow || this._remainingFromOffset(userOffset) < 100) {
        this._onNearEnd();
      }
    });
  },
  _onNearEnd() {
    if (!this.get('disabled')) {
      tryInvoke(this, 'onNearEnd');
    }
  },

  _hasOverflow() {
    return this._contentHeight() > this._containerHeight();
  },
  _invertValueIfIsUp(val) {
    return this.get('_isUp') ? this._contentHeight() - val : val;
  },
  _startingFromOffset(offsetVal) {
    return this.get('_isUp') ? offsetVal - this._containerHeight() : offsetVal;
  },
  _remainingFromOffset(offsetVal) {
    let remaining = this._contentHeight() - offsetVal;
    if (this.get('_isDown')) {
      remaining -= this._containerHeight();
    }
    return remaining;
  },
  _containerHeight() {
    return this.$().height();
  },
  _contentHeight() {
    return this.get('_$content').outerHeight();
  },
});
