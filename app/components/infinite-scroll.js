import callIfPresent from 'textup-frontend/utils/call-if-present';
import Component from '@ember/component';
import Constants from 'textup-frontend/constants';
import PropertyUtils from 'textup-frontend/utils/property';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import { removeObserver, addObserver } from '@ember/object/observers';
import { run, scheduleOnce, once, next } from '@ember/runloop';
import { typeOf, tryInvoke, isPresent } from '@ember/utils';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    contentClass: PropTypes.string,
    data: PropTypes.oneOfType([PropTypes.null, PropTypes.array]),
    numItems: PropTypes.oneOfType([PropTypes.null, PropTypes.number]),
    numTotal: PropTypes.oneOfType([PropTypes.null, PropTypes.number]),
    direction: PropTypes.oneOf(Object.values(Constants.INFINITE_SCROLL.DIRECTION)),
    loadMessage: PropTypes.string,
    refreshMessage: PropTypes.string,
    doRegister: PropTypes.func,
    onRefresh: PropTypes.func,
    onLoad: PropTypes.func,
  }),
  getDefaultProps() {
    return {
      data: [],
      direction: Constants.INFINITE_SCROLL.DIRECTION.DOWN,
      loadMessage: 'Loading',
      refreshMessage: 'Refreshing',
    };
  },
  classNames: 'infinite-scroll',
  classNameBindings: [
    '_isUp:infinite-scroll--up',
    '_publicAPI.isLoading:infinite-scroll--loading',
    '_publicAPI.isDone:infinite-scroll--done',
  ],

  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
    this._scheduleResetAll();
    // `didReceiveAttrs` is not called when the `data` object has items added to it. This hook is only
    // called when the reference is changed to an entirely separate `data` object. Therefore, we rely
    // on an observer to watch for `data` reference AND `data` item changes
    addObserver(this, 'data.[]', this, this._scheduleCheckIfLoadFinish);
  },
  willDestroyElement() {
    this._super(...arguments);
    removeObserver(this, 'data.[]', this, this._scheduleCheckIfLoadFinish);
  },

  // Internal properties
  // -------------------

  _scrollContainer: null,
  _pullToRefresh: null,
  _isUp: equal('direction', Constants.INFINITE_SCROLL.DIRECTION.UP),
  _publicAPI: computed(function() {
    return {
      isLoading: false,
      isDone: false,
      actions: {
        resetAll: this._resetAll.bind(this),
        resetPosition: this._resetPosition.bind(this),
        restorePosition: this._restorePosition.bind(this),
      },
    };
  }),
  _numItems: computed('data.length', 'numItems', function() {
    const numItems = this.get('numItems'),
      dataLength = this.get('data.length');
    if (typeOf(numItems) === 'number') {
      return numItems;
    } else {
      return isPresent(dataLength) ? dataLength : 0;
    }
  }),
  _prevNumItems: null,
  _prevNumTotal: null,
  _didStartLoad: false,
  _numTimesWithoutChanges: 0,
  _hasLoadedAllItems: computed('numTotal', '_numItems', function() {
    const numItems = this.get('_numItems'),
      numTotal = this.get('numTotal');
    return isPresent(numTotal) && numItems >= numTotal;
  }),
  _shouldLoadMore: computed('_publicAPI.isDone', '_hasLoadedAllItems', function() {
    return this.get('_publicAPI.isDone') ? false : !this.get('_hasLoadedAllItems');
  }),

  // Internal handlers
  // -----------------

  // This method is usually called AFTER the `data` has been changed so we want to react immediately.
  // Therefore, we make sure that the `_didStartLoad` flag is FALSE because we trigger a load more via
  // checkNearEnd -> onLoad, which expects the `_didStartLoad` flag to be FALSE.
  // In contrast, `onRefresh` which will kick off a `data` change and therefore should not
  // check if near edge immediately. `onRefresh` triggers a load more via
  // _checkIfLoadFinish -> checkNearEnd -> onLoad. _checkIfLoadFinish expects `_didStartLoad` to be
  // TRUE because it itself will reset this flag back to false for the onLoad handler called later on
  _scheduleResetAll() {
    run(() => scheduleOnce('afterRender', this, this._resetAll));
  },
  _resetAll() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this._resetProperties();
    PropertyUtils.ensurePromise(
      callIfPresent(null, this.get('_scrollContainer.actions.resetPosition'))
    ).then(() => callIfPresent(null, this.get('_scrollContainer.actions.checkNearEnd')));
  },

  _resetPosition() {
    return callIfPresent(null, this.get('_scrollContainer.actions.resetPosition'), [...arguments]);
  },
  _restorePosition() {
    return callIfPresent(null, this.get('_scrollContainer.actions.restoreUserPosition'), [
      ...arguments,
    ]);
  },
  // See `_resetAll`'s description for an explanation for why we need to make sure that `_didStartLoad`
  // is TRUE for `_onRefresh` while `_didStartLoad` must be FALSE for `_resetAll`
  _onRefresh() {
    this._resetProperties();
    this._storeStateOnloadStart(); // call this AFTER resetting the state
    // return value is used by `infinite-scroll/pull-to-refresh`
    return tryInvoke(this, 'onRefresh');
  },
  _onLoad() {
    run(() => {
      if (this.get('_shouldLoadMore')) {
        if (!this.get('_didStartLoad')) {
          this.set('_publicAPI.isLoading', true);
          this._storeStateOnloadStart();
          const loadVal = tryInvoke(this, 'onLoad');
          if (loadVal && loadVal.finally) {
            loadVal.finally(() => run(() => this.set('_publicAPI.isLoading', false)));
          } else {
            this.set('_publicAPI.isLoading', false);
          }
        }
      } else {
        this.set('_publicAPI.isDone', true);
      }
    });
  },
  _resetProperties() {
    this.setProperties({
      '_publicAPI.isLoading': false,
      '_publicAPI.isDone': false,
      _prevNumItems: null,
      _prevNumTotal: null,
      _didStartLoad: false,
      _numTimesWithoutChanges: 0,
    });
  },
  _storeStateOnloadStart() {
    this.setProperties({
      _prevNumItems: this.get('_numItems'),
      _prevNumTotal: this.get('numTotal'),
      _didStartLoad: true,
    });
  },
  _scheduleCheckIfLoadFinish() {
    once(this, this._checkIfLoadFinish);
  },
  _checkIfLoadFinish() {
    if (this.get('_didStartLoad')) {
      const prevNumItems = this.get('_prevNumItems'),
        currentNumItems = this.get('_numItems'),
        prevNumTotal = this.get('_prevNumTotal'),
        currentNumTotal = this.get('numTotal'),
        currentHasLoadedAll = this.get('_hasLoadedAllItems');
      // keep track of the number of times we've tried loading without any changes because
      // we don't want to keep on trying over and over again forever
      if (prevNumItems === currentNumItems && prevNumTotal === currentNumTotal) {
        this.incrementProperty('_numTimesWithoutChanges');
      } else {
        this.set('_numTimesWithoutChanges', 0);
      }
      this.setProperties({
        _didStartLoad: false,
        '_publicAPI.isDone': this.get('_numTimesWithoutChanges') >= 3 || currentHasLoadedAll,
      });
      // Need to schedule to run in the next run loop to all for appropriate restoring of the user's
      // position before we attempt to check if near end
      next(() => callIfPresent(null, this.get('_scrollContainer.actions.checkNearEnd')));
    } else {
      // When items are added to the data array and the user does not manually trigger a restore,
      // then we want to restore the user position here regardless
      next(() => callIfPresent(null, this.get('_scrollContainer.actions.restoreUserPosition')));
    }
  },
});
