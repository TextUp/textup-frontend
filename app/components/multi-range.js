import Ember from 'ember';
import callIfPresent from '../utils/call-if-present';
import defaultIfAbsent from '../utils/default-if-absent';

export default Ember.Component.extend({

	data: defaultIfAbsent([]),
	min: defaultIfAbsent(0),
	max: defaultIfAbsent(1440),

	snap: defaultIfAbsent(1),
	minSize: defaultIfAbsent(15),
	bgLabels: defaultIfAbsent(2),
	readonly: defaultIfAbsent(false),
	rangeClass: defaultIfAbsent('multi-range-item'),
	doubleTapThreshold: defaultIfAbsent(1000), // in milliseconds

	// raw input to valid (one of two items in array)
	doRawToValid: null,
	// valid (one of two items in array) to raw input
	doValidToRaw: null,
	// valid (one of two items in array) to number
	doValidToNum: null,
	// number to valid (one of two items in array)
	doNumToValid: null,
	// valid range (an array of two items) to string for display
	doValidRangeToDisplay: null,
	// calculate indicator
	// passed RangeBar object, Indicator object, recalculate position function
	doIndicator: null,

	// called when an existing range is inputted
	// passed index and updated data in raw format
	// returns nothing, updates data array (in same raw format)
	onUpdate: null,
	// called when a new range is inserted
	// passed data in raw format
	// returns nothing, updates data array (in same raw format)
	onInsert: null,
	// called with a range is deleted
	// passed index
	// returns nothing, updates data array (in same raw format)
	onRemove: null,

	classNames: 'multi-range',
	classNameBindings: ['canEdit::disabled'],

	_rangebarObj: null,

	// Computed properties
	// -------------------

	canEdit: Ember.computed('readonly', 'onUpdate', 'onInsert', 'onRemove', function() {
		const p = (key) => Ember.isPresent(this.get(key)),
			funcs = [p('onUpdate'), p('onInsert'), p('onRemove')];
		return funcs.any((present) => present) && !this.get('readonly');
	}),
	_validInput: Ember.computed('data.[]', function() {
		const data = this.get('data');
		if (!Ember.isArray(data)) {
			return data;
		}
		return data.map(function(items) {
			if (Ember.isArray(items) && items.length === 2) {
				return items.map(function(item) {
					return this.callWithFallback(this.get('doRawToValid'), item);
				}, this);
			} else {
				throw new Ember.Error(`${items} is not an array of two items`);
			}
		}, this);
	}),
	_validMax: Ember.computed('max', function() {
		return this.callWithFallback(this.get('doRawToValid'), this.get('max'));
	}),
	_validMin: Ember.computed('min', function() {
		return this.callWithFallback(this.get('doRawToValid'), this.get('min'));
	}),

	// Events
	// ------

	didInsertElement: function() {
		const rangebarObj = new RangeBar({
			min: this.get('_validMin'),
			max: this.get('_validMax'),
			values: this.get('_validInput'),
			// write own double-click based delete
			allowDelete: false,
			// preserve ordering of ranges
			allowSwap: false,
			readonly: !this.get('canEdit'),
			snap: this.get('snap'),
			minSize: this.get('minSize'),
			bgLabels: this.get('bgLabels'),
			rangeClass: this.get('rangeClass'),
			label: this.get('doValidRangeToDisplay') || this.defaultPassThrough,
			// first, data value (a date string) get passed in here
			// and the return value of this must be a NUMBER so that
			// we know where to place this point on the range bar
			valueParse: this.get('doValidToNum') || this.defaultPassThrough,
			// second, the number that was returned from the parse
			// method is then passed to this format method for conversion
			// from a number to a human-readable string. The net result
			// may be: dateString format 1 -> milliseconds -> dateString format 2
			valueFormat: this.get('doNumToValid') || this.defaultPassThrough,
			indicator: this.get('doIndicator')
		});
		// add to DOM after render
		Ember.run.scheduleOnce('afterRender', this, function() {
			this.$().append(rangebarObj.$el);
			this.setProperties({
				_rangebarObj: rangebarObj,
				_origValidRanges: rangebarObj.val()
			});
			// must come after rangebar obj is set
			this.addBarEventListeners();
		});
	},
	willDestroyElement: function() {
		this.removeBarEventListeners();
		this.get('_rangebarObj').remove();
	},
	dataDidChange: Ember.on('init', Ember.observer('_validInput', function() {
		if (this.get('_skippedFirst')) {
			Ember.run.next(this, this._afterChange);
		}
		this.set('_skippedFirst', true);
	})),

	// Event handlers
	// --------------

	addBarEventListeners: function() {
		if (this.get('_hasBarListeners')) {
			return;
		}
		const rangebarObj = this.get('_rangebarObj'),
			rangeSelector = `.${this.get("rangeClass")}`;
		// event bindings
		rangebarObj.$el
			.on(`change.${this.elementId}`, function(event, ranges, hasChangedRange) {
				// workaround for a bug in event firing
				clearTimeout(this.get('_changeTimeout'));
				const timeout = setTimeout(function() {
					if (Ember.isPresent(hasChangedRange)) {
						const indexInRange = this.getRangeIndex(hasChangedRange);
						this.handleInsertOrUpdate(indexInRange);
					}
				}.bind(this), 10);
				this.set('_changeTimeout', timeout);
			}.bind(this))
			.on(`touchstart.${this.elementId}`, '.elessar-phantom', function(event) {
				const touchEvent = event.originalEvent.touches[0];
				touchEvent.which = 1; // simulate is left click
				touchEvent.type = 'mousedown';
				// ensure minimum size of introduced range
				const val = rangebarObj.phantom.val();
				rangebarObj.phantom.val([val[0], val[0] + 0.1]);
				// calling mousedown with modified touch event
				rangebarObj.phantom.mousedown(touchEvent);
				// phantom persists or is reintroduced so we call
				// removePhantom after a day to ensure that phantom does
				// not show up after adding a new range
				Ember.run.later(rangebarObj, rangebarObj.removePhantom, 100);
			}.bind(this))
			.on(`dblclick.${this.elementId}`, rangeSelector, function(event) {
				const $range = Ember.$(event.target).closest(rangeSelector);
				this.handleRemove(this.getRangeIndex($range));
			}.bind(this))
			.on(`touchmove.${this.elementId}`, rangeSelector, function(event) {
				const $range = Ember.$(event.target).closest(rangeSelector),
					rangeIndex = this.getRangeIndex($range),
					lastPossibleIndex = rangebarObj.ranges.length - 1;
				// don't trigger if index of range is greater than
				// the last possible range
				if (rangeIndex <= lastPossibleIndex) {
					this.set('_touchedOnce', false);
					$range.trigger('mousemove', event);
				}
			}.bind(this))
			.on(`touchend.${this.elementId}`, rangeSelector, function(event) {
				if (!this.get('_touchedOnce')) {
					this.set('_touchedOnce', true);
					Ember.run.later(this, () => this.set('_touchedOnce', false),
						this.get('doubleTapThreshold'));
				} else {
					const $range = Ember.$(event.target).closest(rangeSelector);
					this.handleRemove(this.getRangeIndex($range));
				}

			}.bind(this));
		this.set('_hasBarListeners', true);
	},
	removeBarEventListeners: function() {
		this.get('_rangebarObj').$el.off(`.${this.elementId}`);
		this.set('_hasBarListeners', false);
	},

	// Data
	// ----

	handleInsertOrUpdate: function(indexInRanges) {
		const rangebarObj = this.get('_rangebarObj'),
			rangeData = rangebarObj.val()[indexInRanges];
		if (Ember.isArray(rangeData) && rangeData.length === 2) {
			const changedRawData = rangeData.map(function(item) {
					return this.callWithFallback(this.get('doValidToRaw'), item);
				}, this),
				inputLength = this.get('_validInput.length');
			if (inputLength === rangebarObj.ranges.length) { // update
				const indexInInput = this.getInputIndexFromRangeIndex(indexInRanges);
				this.callWithFallback(this.get('onUpdate'), indexInInput, changedRawData);
			} else { // create
				this.callWithFallback(this.get('onInsert'), changedRawData);
			}
		}
	},
	handleRemove: function(indexInRanges) {
		const indexInInput = this.getInputIndexFromRangeIndex(indexInRanges);
		this.callWithFallback(this.get('onRemove'), indexInInput);
	},
	// Run via the observer on _validInput!
	_afterChange: function() {
		const rangebarObj = this.get('_rangebarObj');
		this.removeBarEventListeners();
		rangebarObj.val([]) // must clear first
			.val(this.get('_validInput'));
		this.set('_origValidRanges', rangebarObj.val());
		Ember.run.scheduleOnce('afterRender', this, this.addBarEventListeners);
	},

	// Indicies
	// --------

	getRangeIndex: function(range) {
		const rangebarObj = this.get('_rangebarObj');
		if (range instanceof Ember.$) { // if is a jQuery object
			const $ranges = rangebarObj.$el.find(`.${this.get('rangeClass')}`);
			return $ranges.index(range[0]);
		} else { // else is a range object
			return rangebarObj.ranges.indexOf(range);
		}
	},
	getInputIndexFromRangeIndex: function(indexInRanges) {
		const validInput = this.get('_validInput'),
			origValidRange = this.get('_origValidRanges')[indexInRanges],
			foundInInput = validInput.find(function(valid) {
				return Ember.compare(valid, origValidRange) === 0;
			});
		return validInput.indexOf(foundInInput);
	},

	// Helpers
	// -------

	callWithFallback: function(onCall, ...args) {
		return callIfPresent(onCall, ...args) || this.defaultPassThrough(...args);
	},
	defaultPassThrough: function(val) {
		return val;
	},
});
