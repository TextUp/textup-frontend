import Ember from 'ember';
import defaultIfAbsent from 'textup-frontend/utils/default-if-absent';

const {
  $,
  computed,
  isPresent,
  computed: { equal: eq },
  run,
  run: { scheduleOnce, next, once, throttle, later, cancel },
  RSVP: { Promise },
} = Ember;

export default Ember.Component.extend({
  data: defaultIfAbsent([]),
  total: null,
  direction: defaultIfAbsent('down'), // up | down
  // OPTIONAL. use this if need to implement custom data length logic
  // if this isn't provided, then defaults to callling data.length
  dataLength: null,
  observeData: defaultIfAbsent(true),
  dataObserveProperty: defaultIfAbsent('data.[]'),

  loadingText: defaultIfAbsent('Loading'),
  // how to close to edge before loading triggered
  loadProximity: defaultIfAbsent(100), // in pixels
  // how long to wait to check the data array if doLoad does
  // not return a Promise
  loadTimeout: defaultIfAbsent(1000), // in milliseconds

  // how closely to call rapidly fired actions
  // Lower for more responsiveness. Higher for better performance.
  throttleThreshold: defaultIfAbsent(100), // in milliseconds

  refreshingText: defaultIfAbsent('Refreshing'),
  // how to close to edge before loading triggered
  refreshThreshold: defaultIfAbsent(50), // in pixels
  // how long to wait to check the data array if doLoad does
  // not return a Promise
  refreshTimeout: defaultIfAbsent(1000), // in milliseconds

  doRegister: null,
  doRefresh: null,
  // passed nothing
  // return Promise indicating that loading is done
  // method modifies 'data' and 'total' properties
  doLoad: null,

  containerClass: defaultIfAbsent(''),
  itemsClass: defaultIfAbsent(''),
  controlClass: defaultIfAbsent(''),
  refreshClass: defaultIfAbsent(''),
  classNameBindings: [
    '_isUp:scroll-up:scroll-down',
    '_isLoading:loading',
    '_isDone:done',
    '_isRefreshing:refreshing',
    '_isPulling:pulling',
  ],
  classNames: 'infinite-scroll',

  _isLoading: false,
  _isDisplaying: false,
  _isRefreshing: false,
  _isPulling: false,
  _hasError: false,
  // manually keep track of data items to be rendered
  _items: null,
  // keep track of versions so that we can cancel any leftover load actions
  // if we need to refresh component due to updated attributes
  _version: 0,

  // Computed properties
  // -------------------

  _$container: computed(function() {
    return this.$('.infinite-container');
  }),
  _$refreshing: computed(function() {
    return this.$('.infinite-scroll-refreshing');
  }),
  _total: computed('total', function() {
    const total = this.get('total');
    return isNaN(total) ? 10 : parseInt(total);
  }),
  _displayTimers: computed(function() {
    return [];
  }),
  publicAPI: computed('_total', 'direction', '_isLoading', '_hasError', '_version', function() {
    return {
      total: this.get('_total'),
      direction: this.get('direction'),
      isLoading: this.get('_isLoading'),
      _hasError: this.get('_hasError'),
      _version: this.get('_version'),
      actions: {
        loadMore: this.loadMoreIfNeeded.bind(this, true),
        resetPosition: () => scheduleOnce('afterRender', this, this._restorePosition, true, true),
        restorePosition: () =>
          scheduleOnce('afterRender', this, this._restorePosition, false, true),
      },
    };
  }),
  _isUp: eq('direction', 'up'),
  _dataLength: computed('data.[]', 'dataLength', function() {
    const customLength = this.get('dataLength');
    return isPresent(customLength) ? customLength : this.get('data.length');
  }),
  _isDone: computed('_total', '_dataLength', 'doLoad', '_hasError', function() {
    const hasLoadHook = isPresent(this.get('doLoad')),
      notError = !this.get('_hasError');
    return hasLoadHook && notError ? this.get('_dataLength') >= this.get('_total') : true;
  }),
  _pullLength: computed('_pullStart', '_pullNow', function() {
    const start = this.get('_pullStart'),
      current = this.get('_pullNow');
    return start && current ? Math.abs(start - current) : null;
  }),
  _pullIsWrongDirection: computed('_pullStart', '_pullNow', '_isUp', function() {
    const start = this.get('_pullStart'),
      current = this.get('_pullNow');
    // if direction is up, then wrong direction is if current is greater than
    // or BELOW the starting position, vice versa for down
    // start and current use pageY so are relative to top edge of document
    return this.get('_isUp') ? current > start : start > current;
  }),

  // Events
  // ------

  didInitAttrs() {
    this._super(...arguments);
    Ember.tryInvoke(this, 'doRegister', [this.get('publicAPI')]);
  },
  didInsertElement() {
    scheduleOnce('afterRender', this, function() {
      this._setup(true);
      // bind event handlers
      const elId = this.elementId;
      $(window).on(`orientationchange.${elId} resize.${elId}`, this._restorePosition.bind(this));
      this.get('_$container')
        .on(`scroll.${elId}`, this.onScroll.bind(this))
        .on(`touchstart.${elId}`, this.startTouch.bind(this))
        .on(`touchmove.${elId}`, this.moveTouch.bind(this))
        .on(`touchend.${elId}`, this.endPull.bind(this))
        .on(`mousedown.${elId}`, this.startMouse.bind(this))
        .on(`mousemove.${elId}`, this.moveMouse.bind(this))
        .on(`mouseup.${elId}`, this.endPull.bind(this))
        .on(`mouseleave.${elId}`, this.endPull.bind(this));
    });
  },
  willDestroyElement() {
    this.get('_$container').off(`.${this.elementId}`);
    $(window).off(`.${this.elementId}`);
    this._stopObserve();
  },
  didUpdateAttrs() {
    const timers = this.get('_displayTimers');
    // only rerun setup if the data array has been changed to another array
    if (this.get('_prevData') !== this.get('data')) {
      timers.forEach(cancel);
      scheduleOnce('afterRender', this, this._setup, false);
    } else {
      // re-display items and load more after the data array has changed
      this._tryDisplayItems();
    }
    timers.clear();
  },
  _setup(shouldReset = false) {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    // must reset properties before calling displayItems
    this.setProperties({
      _isLoading: false,
      _hasError: false,
      _isDisplaying: false,
      _isPulling: false,
      _items: [],
      _prevData: this.get('data'),
    });
    this._resetPull();
    this.incrementProperty('_version');
    this._startObserve();
    once(this, this.displayItems, shouldReset);
  },

  // Observe data
  // ------------

  _startObserve() {
    const shouldObserve = this.get('observeData'),
      observeProp = this.get('dataObserveProperty');
    if (shouldObserve) {
      this.addObserver(observeProp, this, this._tryDisplayItems);
    }
  },
  _stopObserve() {
    const observeProp = this.get('dataObserveProperty');
    this.removeObserver(observeProp, this, this._tryDisplayItems);
  },
  _tryDisplayItems() {
    // add to a timers queue so cancel when we've completely swapped out arrays
    // and are doing a setup instead of just a re-display
    const timers = this.get('_displayTimers');
    // also, do NOT throttle. If you throttle then the spacing of the calls makes it
    // so that each display items call is in a separate runloop and actually triggers
    // displayItems each time. If you don't throttle, then the repeated scheduleOnce
    // calls all happen in the same runloop and only fires displayItems once
    timers.pushObject(scheduleOnce('afterRender', this, this.displayItems, false));
  },

  // Preserve location
  // -----------------

  _storePosition() {
    const container = this.get('_$container')[0];
    this.setProperties({
      _previousClientHeight: container.clientHeight,
      _previousScrollHeight: container.scrollHeight,
      _previousScrollTop: container.scrollTop,
    });
  },
  _restorePosition(shouldReset = false, userTriggered = false) {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    const $container = this.get('_$container'),
      container = $container[0],
      isUp = this.get('_isUp');
    let newScrollTop;
    if (shouldReset) {
      newScrollTop = isUp ? container.scrollHeight - container.clientHeight : 0;
    } else if (isUp) {
      const prevScrollHeight = this.get('_previousScrollHeight'),
        prevClientHeight = this.get('_previousClientHeight'),
        prevScrollTop = this.get('_previousScrollTop'),
        scrollHeightAdjustment = container.scrollHeight - prevScrollHeight,
        clientHeightAdjustment = prevClientHeight - container.clientHeight;
      newScrollTop = scrollHeightAdjustment + clientHeightAdjustment + prevScrollTop;
    }
    if (newScrollTop) {
      // animate if user triggered
      if (userTriggered) {
        this.get('_$container').animate({ scrollTop: newScrollTop }, 200);
      } else {
        container.scrollTop = newScrollTop;
      }
    }
  },

  // Refreshing
  // ----------

  onScroll(event) {
    if (this.get('_isDisplaying')) {
      event.preventDefault();
    }
    throttle(
      this,
      function() {
        this._storePosition();
        this.loadMoreIfNeeded();
      },
      this.get('throttleThreshold')
    );
  },
  startTouch(event) {
    this._startPull(event.originalEvent.targetTouches[0].pageY);
  },
  startMouse(event) {
    this._startPull(event.pageY);
  },
  moveTouch(event) {
    if (this.get('_isDisplaying')) {
      event.preventDefault();
    }
    throttle(
      this,
      this._continuePull,
      event.originalEvent.targetTouches[0].pageY,
      this.get('throttleThreshold')
    );
  },
  moveMouse(event) {
    if (this.get('_isDisplaying')) {
      event.preventDefault();
    }
    throttle(this, this._continuePull, event.pageY, this.get('throttleThreshold'));
  },

  _startPull(position) {
    if (
      !this.get('doRefresh') ||
      this.get('_isRefreshing') ||
      this.get('_isDisplaying') ||
      !this._isAtStart()
    ) {
      return;
    }
    this.set('_pullStart', position);
    this.set('_isPulling', true);
  },
  _continuePull(position) {
    if (
      !this.get('doRefresh') ||
      this.get('_isRefreshing') ||
      this.get('_isDisplaying') ||
      !this.get('_pullStart')
    ) {
      return;
    }
    this.set('_pullNow', position);
    this.set('_isPulling', true);
    this._doOverscroll(this.get('_pullLength'));
  },
  endPull() {
    if (
      !this.get('doRefresh') ||
      this.get('_isRefreshing') ||
      this.get('_isDisplaying') ||
      !this.get('_pullStart')
    ) {
      return;
    }
    const shouldRefresh = this.get('_pullLength') >= this.get('refreshThreshold');
    this.set('_isRefreshing', shouldRefresh);
    this.set('_isPulling', false);
    if (shouldRefresh && !this.get('_pullIsWrongDirection')) {
      this._doOverscroll(this.get('refreshThreshold'));
      this._showRefreshingMessage();

      const result = this.get('doRefresh')();
      if (result && result.then) {
        result.then(this._setup.bind(this));
      } else {
        later(this, this._setup, this.get('refreshTimeout'));
      }
    } else {
      this._resetPull();
    }
  },
  _showRefreshingMessage() {
    const $refreshing = this.get('_$refreshing'),
      position = this.get('refreshThreshold') / 2;
    if (this.get('_isUp')) {
      $refreshing.css({
        top: '',
        bottom: `${position}px`,
      });
    } else {
      $refreshing.css({
        bottom: '',
        top: `${position}px`,
      });
    }
    $refreshing.fadeIn();
  },
  _doOverscroll(length) {
    if (!isPresent(length) || this.get('_pullIsWrongDirection')) {
      return;
    }
    const $container = this.get('_$container'),
      threshold = this.get('refreshThreshold'),
      direction = this.get('_isUp') ? -1 : 1,
      overscroll = Math.min(length, threshold * 2),
      prop = `translateY(${overscroll * direction}px)`;
    $container.css({
      transform: prop,
      '-webkit-transform': prop,
    });
  },
  _resetPull() {
    this.set('_isRefreshing', false);
    this.set('_pullStart', null);
    this.set('_pullNow', null);
    this.get('_$container').css({
      transform: '',
      '-webkit-transform': '',
    });
    this.get('_$refreshing').hide();
  },

  // Loading
  // -------

  loadMoreIfNeeded(forceLoad = false) {
    if (
      !forceLoad &&
      (this.get('_isDone') || this.get('_isLoading') || (this._canScroll() && !this._isNearEdge()))
    ) {
      return;
    }
    const versionWhenCalled = this.get('_version'),
      after = function(isSuccess) {
        if (this.isDestroying || this.isDestroyed) {
          return;
        }
        if (versionWhenCalled === this.get('_version')) {
          this.setProperties({
            _isLoading: false,
            _hasError: !isSuccess,
          });
        }
      };
    this._loadMore().then(after.bind(this, true), after.bind(this, false));
  },
  _loadMore() {
    this.set('_isLoading', true);
    return new Promise((resolve, reject) => {
      const loadResult = this.get('doLoad')();
      if (loadResult.then) {
        loadResult.then(resolve, reject);
      } else {
        later(this, resolve, this.get('loadTimeout'));
      }
    });
  },
  _isNearEdge() {
    const container = this.get('_$container')[0],
      sTop = container.scrollTop,
      sHeight = container.scrollHeight,
      cHeight = container.clientHeight,
      proximity = this.get('loadProximity');
    return this.get('_isUp') ? sTop < proximity : sTop + cHeight + proximity > sHeight;
  },
  _isAtStart() {
    if (!this._canScroll()) {
      return true;
    }
    const container = this.get('_$container')[0],
      sTop = container.scrollTop,
      sHeight = container.scrollHeight,
      cHeight = container.clientHeight;
    return this.get('_isUp') ? sTop + cHeight >= sHeight : sTop === 0;
  },
  _canScroll() {
    const container = this.get('_$container')[0];
    return container.scrollHeight > container.clientHeight;
  },

  // Managing items
  // --------------

  displayItems(shouldReset = false) {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    this._storePosition();
    run(() => {
      const items = this.get('_items');
      items.clear();
      items.pushObjects(this.get('data'));
      this.set('_isDisplaying', true); // to fade out and lock infinite items
      next(this, function() {
        this._restorePosition(shouldReset);
        scheduleOnce('afterRender', this, function() {
          if (this.get('isDestroying') || this.get('isDestroyed')) {
            return;
          }
          this.set('_isDisplaying', false); // to fade in and unlock infinite items
          this._storePosition();
          this.loadMoreIfNeeded();
        });
      });
    });
  },
});
