import Component from '@ember/component';
import Constants from 'textup-frontend/constants';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import { htmlSafe } from '@ember/template';
import { run, scheduleOnce, throttle } from '@ember/runloop';
import { typeOf, tryInvoke, isNone } from '@ember/utils';

export const MIN_REQUIRED_PULL_LENGTH_IN_PX = 100;
export const MAX_PULL_LENGTH_IN_PX = 150;

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    direction: PropTypes.oneOf(Object.values(Constants.INFINITE_SCROLL.DIRECTION)),
    disabled: PropTypes.bool,
    doRegister: PropTypes.func,
    onRefresh: PropTypes.func,
    refreshMessage: PropTypes.string,
  }),
  getDefaultProps() {
    return {
      direction: Constants.INFINITE_SCROLL.DIRECTION.DOWN,
      disabled: false,
      refreshMessage: 'Refreshing',
    };
  },
  classNames: 'infinite-scroll__pull-to-refresh',
  classNameBindings: [
    '_isUp:infinite-scroll__pull-to-refresh--up',
    '_isPullCorrectDirection:infinite-scroll__pull-to-refresh--pulling',
    '_publicAPI.isRefreshing:infinite-scroll__pull-to-refresh--refreshing',
    'disabled:infinite-scroll__pull-to-refresh--disabled',
  ],

  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
  },

  touchStart(event) {
    this._startPull(this._touchEventPosition(event));
  },
  touchMove(event) {
    throttle(this, this._continuePull, this._touchEventPosition(event), 100);
  },
  touchEnd() {
    this._endPull();
  },

  mouseDown(event) {
    this._startPull(this._mouseEventPosition(event));
  },
  mouseMove(event) {
    throttle(this, this._continuePull, this._mouseEventPosition(event), 100);
  },
  mouseUp() {
    this._endPull();
  },
  mouseLeave() {
    this._endPull();
  },

  // Internal properties
  // -------------------

  _publicAPI: computed(function() {
    return { isRefreshing: false };
  }),
  _isUp: equal('direction', Constants.INFINITE_SCROLL.DIRECTION.UP),
  _ignorePullEvent: computed('disabled', '_publicAPI.isRefreshing', function() {
    return this.get('disabled') || this.get('_publicAPI.isRefreshing');
  }),
  _pullStart: null,
  _pullEnd: null,
  _validPullCoords: computed('_pullStart', '_pullEnd', function() {
    return typeOf(this.get('_pullStart')) === 'number' && typeOf(this.get('_pullEnd')) === 'number';
  }),
  _pullLength: computed('_validPullCoords', '_pullStart', '_pullEnd', function() {
    return this.get('_validPullCoords')
      ? Math.abs(this.get('_pullStart') - this.get('_pullEnd'))
      : 0;
  }),
  _isPullCorrectDirection: computed(
    '_validPullCoords',
    '_pullStart',
    '_pullEnd',
    '_isUp',
    function() {
      if (this.get('_validPullCoords')) {
        const start = this.get('_pullStart'),
          end = this.get('_pullEnd');
        return this.get('_isUp') ? start > end : start < end;
      } else {
        return false;
      }
    }
  ),
  _contentOverscrollStyle: computed(
    '_pullLength',
    '_isPullCorrectDirection',
    '_publicAPI.isRefreshing',
    '_isUp',
    function() {
      if (this.get('_publicAPI.isRefreshing') || !this.get('_isPullCorrectDirection')) {
        return htmlSafe();
      } else {
        const direction = this.get('_isUp') ? -1 : 1,
          length = Math.min(this.get('_pullLength'), MAX_PULL_LENGTH_IN_PX);
        return htmlSafe(`transform: translateY(${direction * length}px);`);
      }
    }
  ),

  // Internal methods
  // ----------------

  _startPull(position) {
    if (this.get('_ignorePullEvent')) {
      return;
    }
    this.set('_pullStart', position);
  },
  _continuePull(position) {
    if (isNone(this.get('_pullStart')) || this.get('_ignorePullEvent')) {
      return;
    }
    this.set('_pullEnd', position);
  },
  _endPull() {
    if (isNone(this.get('_pullStart')) || this.get('_ignorePullEvent')) {
      return;
    }
    const shouldRefresh =
      this.get('_isPullCorrectDirection') &&
      this.get('_pullLength') > MIN_REQUIRED_PULL_LENGTH_IN_PX;
    this.setProperties({
      _pullStart: null,
      _pullEnd: null,
      '_publicAPI.isRefreshing': shouldRefresh,
    });
    if (shouldRefresh) {
      this._onRefresh();
    }
  },
  _onRefresh() {
    const refreshVal = tryInvoke(this, 'onRefresh');
    if (refreshVal && refreshVal.finally) {
      refreshVal.finally(() => run(() => this.set('_publicAPI.isRefreshing', false)));
    } else {
      this.set('_publicAPI.isRefreshing', false);
    }
  },

  _mouseEventPosition(event) {
    return event.pageY;
  },
  _touchEventPosition(event) {
    return event.originalEvent.targetTouches[0].pageY;
  },
});
