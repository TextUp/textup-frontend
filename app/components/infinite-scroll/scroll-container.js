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

  init() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
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
        run.scheduleOnce('afterRender', this, this._scrollToOffset, resolve, 0, shouldAnimate)
      );
    });
  },
  _scheduleRestoreUserPosition(shouldAnimate = false) {
    return new RSVP.Promise(resolve => {
      run.join(() => {
        const offset = this.get('_userOffsetFromInitial');
        run.scheduleOnce('afterRender', this, this._scrollToOffset, resolve, offset, shouldAnimate);
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
  // offset should be relative to the "leading edge" of the viewport. That is, when scrolling down,
  // the leading edge is the top edge of the viewport. When scrolling up, the leading edge of the viewport
  // is the bottom edge of the viewport. Calculating the offset relative to the leading edge allows us
  // to account for `scroll-container` viewport height changes
  _invertValueIfIsUp(val) {
    return this.get('_isUp') ? this._contentHeight() - (val + this._containerHeight()) : val;
  },
  // starting is defined as the distance between the initial position and the leading edge. This is
  // exactly the same as the offset so we just return the offset value without any changes
  _startingFromOffset(offsetVal) {
    return offsetVal;
  },
  // remaining is defined as the distance between the lagging edge and the final position
  // (the end of the content). For example, if scrolling up, the lagging edge is the top of the
  // container viewport and the final position is the very top of the content element
  _remainingFromOffset(offsetVal) {
    return this._contentHeight() - offsetVal - this._containerHeight();
  },
  _containerHeight() {
    return this.$().height();
  },
  _contentHeight() {
    return this.get('_$content').outerHeight();
  },
});
