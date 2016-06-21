import Ember from 'ember';
import defaultIfAbsent from '../utils/default-if-absent';
import callIfPresent from '../utils/call-if-present';

export default Ember.Component.extend({

	data: defaultIfAbsent([]),
	total: defaultIfAbsent(0),
	direction: defaultIfAbsent('down'), // up | down

	loadingText: defaultIfAbsent('Loading'),
	// how to close to edge before loading triggered
	loadProximity: defaultIfAbsent(100), // in pixels
	// how long to wait to check the data array if doLoad does
	// not return a Promise
	loadTimeout: defaultIfAbsent(1000), // in milliseconds

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
		'_isRefreshing:refreshing'
	],
	classNames: 'infinite-scroll',

	_isLoading: false,
	_isRefreshing: false,
	_hasError: false,
	// manually keep track of data items to be rendered
	_items: null,
	// keep track of versions so that we can cancel any leftover load actions
	// if we need to refresh component due to updated attributes
	_version: 0,

	// Computed properties
	// -------------------

	_$container: Ember.computed(function() {
		return this.$('.infinite-container');
	}),
	_$refreshing: Ember.computed(function() {
		return this.$('.infinite-scroll-refreshing');
	}),
	_total: Ember.computed('total', function() {
		const total = this.get('total');
		return isNaN(total) ? 10 : parseInt(total);
	}),
	publicAPI: Ember.computed('_total', 'direction', '_isLoading', '_hasError',
		'_version',
		function() {
			return {
				total: this.get('_total'),
				direction: this.get('direction'),
				isLoading: this.get('_isLoading'),
				_hasError: this.get('_hasError'),
				_version: this.get('_version'),
				actions: {
					loadMore: this.loadMoreIfNeeded.bind(this, true),
					resetPosition: function() {
						Ember.run.scheduleOnce('afterRender', this, this._afterAdd, true);
					}.bind(this)
				}
			};
		}),
	_isUp: Ember.computed.equal('direction', 'up'),
	_isDone: Ember.computed('_total', 'data.[]', 'doLoad', '_hasError', function() {
		return (this.get('doLoad') && !this.get('_hasError')) ?
			this.get('data.length') >= this.get('_total') :
			true;
	}),
	_pullLength: Ember.computed('_pullStart', '_pullNow', function() {
		const start = this.get('_pullStart'),
			current = this.get('_pullNow');
		return (start && current) ? Math.abs(start - current) : null;
	}),
	_pullIsWrongDirection: Ember.computed('_pullStart', '_pullNow', '_isUp', function() {
		const start = this.get('_pullStart'),
			current = this.get('_pullNow');
		// if direction is up, then wrong direction is if current is greater than
		// or BELOW the starting position, vice versa for down
		// start and current use pageY so are relative to top edge of document
		return this.get('_isUp') ? (current > start) : (start > current);
	}),

	// Events
	// ------

	didInitAttrs: function() {
		this._super(...arguments);
		callIfPresent(this.get('doRegister'), this.get('publicAPI'));
	},
	didInsertElement: function() {
		Ember.run.scheduleOnce('afterRender', this, function() {
			this._setup(true);
			// bind event handlers
			const elId = this.elementId;
			Ember.$(window).on(`orientationchange.${elId} resize.${elId}`,
				this.restorePercentFromTop.bind(this));
			this.get('_$container')
				.on(`scroll.${elId}`, function() {
					this.storePercentFromTop();
					this.loadMoreIfNeeded();
				}.bind(this))
				.on(`touchstart.${elId}`, this.startTouch.bind(this))
				.on(`touchmove.${elId}`, this.moveTouch.bind(this))
				.on(`touchend.${elId}`, this.endPull.bind(this))
				.on(`mousedown.${elId}`, this.startMouse.bind(this))
				.on(`mousemove.${elId}`, this.moveMouse.bind(this))
				.on(`mouseup.${elId}`, this.endPull.bind(this))
				.on(`mouseleave.${elId}`, this.endPull.bind(this));
		});
	},
	willDestroyElement: function() {
		this.get('_$container').off(`.${this.elementId}`);
		Ember.$(window).off(`.${this.elementId}`);
	},
	didUpdateAttrs: function() {
		// only rerun setup if the data array has been changed to another array
		if (this.get('_prevData') !== this.get('data')) {
			Ember.run.scheduleOnce('afterRender', this, this._setup, false);
		}
	},
	_setup: function(shouldReset = false) {
		if (this.isDestroying || this.isDestroyed) {
			return;
		}
		// must reset properties before calling displayItems
		this.setProperties({
			_isLoading: false,
			_hasError: false,
			_items: [],
			_prevData: this.get('data'),
		});
		this._resetPull();
		this.incrementProperty('_version');
		Ember.run.once(this, this.displayItems, this.loadMoreIfNeeded.bind(this), true, shouldReset);
	},

	// Preserve location
	// -----------------

	storePercentFromTop: function() {
		if (this.isDestroying || this.isDestroyed) {
			return;
		}
		const container = this.get('_$container')[0],
			percentFromTop = container.scrollTop / container.scrollHeight;
		this.set('_percentFromTop', percentFromTop);
		return percentFromTop;
	},
	restorePercentFromTop: function() {
		const container = this.get('_$container')[0],
			percentFromTop = this.get('_percentFromTop');
		if (Ember.isPresent(percentFromTop)) {
			container.scrollTop = container.scrollHeight * percentFromTop;
		}
	},

	// Refreshing
	// ----------

	startTouch: function(event) {
		this._startPull(event.originalEvent.targetTouches[0].pageY);
	},
	startMouse: function(event) {
		this._startPull(event.pageY);
	},
	moveTouch: function(event) {
		Ember.run.throttle(this, this._continuePull,
			event.originalEvent.targetTouches[0].pageY, 100);
	},
	moveMouse: function(event) {
		Ember.run.throttle(this, this._continuePull,
			event.pageY, 100);
	},

	_startPull: function(position) {
		if (!this.get('doRefresh') || this.get('_isRefreshing') ||
			!this._isAtStart()) {
			return;
		}
		this.set('_pullStart', position);
	},
	_continuePull: function(position) {
		if (!this.get('doRefresh') || this.get('_isRefreshing') ||
			!this.get('_pullStart')) {
			return;
		}
		this.set('_pullNow', position);
		this._doOverscroll(this.get('_pullLength'));
	},
	endPull: function() {
		if (!this.get('doRefresh') || this.get('_isRefreshing') ||
			!this.get('_pullStart')) {
			return;
		}
		const shouldRefresh = this.get('_pullLength') >= this.get('refreshThreshold');
		this.set('_isRefreshing', shouldRefresh);
		if (shouldRefresh && !this.get('_pullIsWrongDirection')) {
			this._doOverscroll(this.get('refreshThreshold'));
			this._showRefreshingMessage();

			const result = this.get('doRefresh')();
			if (result && result.then) {
				result.then(this._setup.bind(this));
			} else {
				Ember.run.later(this, this._setup, this.get('refreshTimeout'));
			}
		} else {
			this._resetPull();
		}
	},
	_showRefreshingMessage: function() {
		const $refreshing = this.get('_$refreshing'),
			position = this.get('refreshThreshold') / 2;
		if (this.get('_isUp')) {
			$refreshing.css({
				top: '',
				bottom: `${position}px`
			});
		} else {
			$refreshing.css({
				bottom: '',
				top: `${position}px`
			});
		}
		$refreshing.fadeIn();
	},
	_doOverscroll: function(length) {
		if (!Ember.isPresent(length) || this.get('_pullIsWrongDirection')) {
			return;
		}
		const $container = this.get('_$container'),
			threshold = this.get('refreshThreshold'),
			direction = this.get('_isUp') ? -1 : 1,
			overscroll = Math.min(length, threshold * 2),
			prop = `translateY(${overscroll * direction}px)`;
		$container.css({
			'transform': prop,
			'-webkit-transform': prop
		});
	},
	_resetPull: function() {
		this.set('_isRefreshing', false);
		this.set('_pullStart', null);
		this.set('_pullNow', null);
		this.get('_$container').css({
			'transform': '',
			'-webkit-transform': ''
		});
		this.get('_$refreshing').hide();
	},

	// Loading
	// -------

	loadMoreIfNeeded: function(forceLoad = false) {
		if (!forceLoad && (this.get('_isDone') || this.get('_isLoading') ||
				(this._canScroll() && !this._isNearEdge()))) {
			return;
		}
		const versionWhenCalled = this.get('_version');
		this._loadMore().then(function() {
			if (this.isDestroying || this.isDestroyed) {
				return;
			}
			this.setProperties({
				_isLoading: false,
				_hasError: false
			});
			// only call display if the version matches to prevent
			// displayItems from being called multiple times
			if (versionWhenCalled === this.get('_version')) {
				Ember.run.once(this, this.displayItems, this.loadMoreIfNeeded.bind(this));
			}
		}.bind(this), function() {
			if (this.isDestroying || this.isDestroyed) {
				return;
			}
			// setting hasError makes isDone true
			this.setProperties({
				_isLoading: false,
				_hasError: true
			});
		}.bind(this));
	},
	_loadMore: function() {
		this.set('_isLoading', true);
		return new Ember.RSVP.Promise(function(resolve, reject) {
			const loadResult = this.get('doLoad')();
			if (loadResult.then) {
				loadResult.then(resolve, reject);
			} else {
				Ember.run.later(this, resolve, this.get('loadTimeout'));
			}
		}.bind(this));
	},
	_isNearEdge: function() {
		const container = this.get('_$container')[0],
			sTop = container.scrollTop,
			sHeight = container.scrollHeight,
			cHeight = container.clientHeight,
			proximity = this.get('loadProximity');
		return this.get('_isUp') ?
			(sTop < proximity) :
			(sTop + cHeight + proximity > sHeight);
	},
	_isAtStart: function() {
		if (!this._canScroll()) {
			return true;
		}
		const container = this.get('_$container')[0],
			sTop = container.scrollTop,
			sHeight = container.scrollHeight,
			cHeight = container.clientHeight;
		return this.get('_isUp') ?
			(sTop + cHeight >= sHeight) :
			(sTop === 0);
	},
	_canScroll: function() {
		const container = this.get('_$container')[0];
		return container.scrollHeight > container.clientHeight;
	},

	// Managing items
	// --------------

	displayItems: function(callback, isSettingUp = false, shouldReset = false) {
		if (this.isDestroying || this.isDestroyed) {
			return;
		}
		const renderedItems = this.get('_items'),
			passedInData = this.get('data'),
			itemsLen = renderedItems.length,
			dataLen = passedInData.length;
		if (dataLen > itemsLen) {
			const numNew = dataLen - itemsLen;
			let newItems = passedInData.slice(-numNew);
			// if is up, then we need to reverse items
			if (this.get('_isUp')) {
				newItems.reverseObjects(); // in-place reversal
			}
			this._beforeAdd();
			Ember.run(function() {
				if (this.get('_isUp')) {
					renderedItems.unshiftObjects(newItems);
				} else {
					renderedItems.pushObjects(newItems);
				}
				Ember.run.next(this, function() {
					this._afterAdd(shouldReset);
					Ember.run.scheduleOnce('afterRender', this, function() {
						this.storePercentFromTop();
						callIfPresent(callback);
					});
				});
			}.bind(this));
		} else {
			// can't set isDone directly because destroys computed property
			// instead, set has error because, after loading, no additional
			// items were added to the data array
			// CANNOT error when setting up because we might have
			// passed in an empty data array, expecting the component to load
			// the initial data through a doLoad call
			if (!isSettingUp) {
				this.set('_hasError', true);
			}
			Ember.run.scheduleOnce('afterRender', this, function() {
				callIfPresent(callback);
			});
		}
	},
	_beforeAdd: function() {
		const container = this.get('_$container')[0];
		this.set('_prevHeightLeft', container.scrollHeight - container.scrollTop);
	},
	_afterAdd: function(isSettingUp = false) {
		if (this.isDestroying || this.isDestroyed) {
			return;
		}
		const container = this.get('_$container')[0];
		if (isSettingUp) {
			if (this.get('_isUp')) {
				container.scrollTop = container.scrollHeight - container.clientHeight;
			} else {
				container.scrollTop = 0;
			}
		} else if (this.get('_isUp')) {
			const prevHeightLeft = this.get('_prevHeightLeft');
			container.scrollTop = container.scrollHeight - prevHeightLeft;
		}
	},
});
