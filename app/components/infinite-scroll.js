import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, isPresent, tryInvoke, run, RSVP } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    data: PropTypes.oneOfType([PropTypes.null, PropTypes.array]),
    numTotal: PropTypes.oneOfType([PropTypes.null, PropTypes.number]),
    direction: PropTypes.oneOf(Object.values(Constants.INFINITE_SCROLL.DIRECTION)),
    loadMessage: PropTypes.string,
    refreshMessage: PropTypes.string,
    doRegister: PropTypes.func,
    onRefresh: PropTypes.func,
    onLoad: PropTypes.func,
  },
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

  didInitAttrs() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
    run.scheduleOnce('afterRender', this, this._resetAll);
  },
  didReceiveAttrs() {
    this._super(...arguments);
    this._checkIfLoadFinish();
  },

  // Internal properties
  // -------------------

  _scrollContainer: null,
  _pullToRefresh: null,
  _isUp: computed.equal('direction', Constants.INFINITE_SCROLL.DIRECTION.UP),
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
  _numItems: computed('data.length', function() {
    const numItems = this.get('data.length');
    return isPresent(numItems) ? numItems : 0;
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
    return !this.get('_publicAPI.isDone') || !this.get('_hasLoadedAllItems');
  }),

  // Internal handlers
  // -----------------

  _resetAll() {
    this.setProperties({
      '_publicAPI.isLoading': false,
      '_publicAPI.isDone': false,
      _prevNumItems: null,
      _prevNumTotal: null,
      _didStartLoad: false,
      _numTimesWithoutChanges: 0,
    });
  },
  _resetPosition() {
    const _scrollContainer = this.get('_scrollContainer');
    if (_scrollContainer) {
      return _scrollContainer.actions.resetPosition(...arguments);
    }
  },
  _restorePosition() {
    const _scrollContainer = this.get('_scrollContainer');
    if (_scrollContainer) {
      return _scrollContainer.actions.restoreUserPosition(...arguments);
    }
  },
  _onRefresh() {
    this._resetAll();
    // return value is used by `infinite-scroll/pull-to-refresh`
    return tryInvoke(this, 'onRefresh');
  },

  _onLoad() {
    run(() => {
      if (this.get('_shouldLoadMore')) {
        this.set('_publicAPI.isLoading', true);
        this._storeStateOnloadStart();
        const loadVal = tryInvoke(this, 'onLoad');
        if (loadVal && loadVal.finally) {
          loadVal.finally(() => run(() => this.set('_publicAPI.isLoading', false)));
        } else {
          this.set('_publicAPI.isLoading', false);
        }
      } else {
        this.set('_publicAPI.isDone', true);
      }
    });
  },
  _storeStateOnloadStart() {
    this.setProperties({
      _prevNumItems: this.get('_numItems'),
      _prevNumTotal: this.get('numTotal'),
      _didStartLoad: true,
    });
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
    }
  },
});
