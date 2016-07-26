import callIfPresent from '../utils/call-if-present';
import defaultIfAbsent from '../utils/default-if-absent';
import Ember from 'ember';
import moment from 'moment';

const {
	computed,
	computed: {
		and
	}
} = Ember;

export default Ember.Component.extend({
	datePlaceholder: defaultIfAbsent('Select date'),
	timePlaceholder: defaultIfAbsent('Select time'),

	dateFormat: defaultIfAbsent('ddd mmm d, yyyy'),
	timeFormat: defaultIfAbsent('h:i A'),

	min: null,
	max: null,

	disabled: defaultIfAbsent(false),
	showDate: defaultIfAbsent(true),
	showTime: defaultIfAbsent(true),

	value: null,
	onSelect: null,

	wormholeClass: defaultIfAbsent('datetime-control-wormhole'),
	classNames: 'datetime-control',

	// keep track of an interval copy of the value that we manually sync
	// with the actual value to avoid multiple render issues
	_value: computed(function() {
		return this.get('value');
	}),

	// Computed properties
	// -------------------

	showBoth: and('showDate', 'showTime'),
	dateOptions: computed('dateFormat', 'min', 'max', function() {
		const options = {
				format: this.get('dateFormat')
			},
			min = this.get('min'),
			max = this.get('max');
		if (min) {
			const minMoment = moment(min).add(1, 'day');
			options.min = minMoment.toDate();
			if (minMoment.isAfter(new Date())) { // if is after now, hide 'Today'
				options.today = '';
			}
		}
		if (max) {
			options.max = max;
		}
		return options;
	}),
	destination: computed(function() {
		return `${this.elementId}--wormhole`;
	}),
	$wormholeParent: computed(function() {
		const rootSelector = Ember.testing ? '#ember-testing' :
			Ember.getOwner(this).lookup('application:main').rootElement;
		return Ember.$(rootSelector);
	}),
	$wormhole: computed('destination', 'wormholeClass', function() {
		const destination = this.get('destination'),
			wormholeClass = this.get('wormholeClass');
		return Ember.$(`<div id='${destination}' class='${wormholeClass}'></div>`);
	}),

	// Events
	// ------

	init: function() {
		this._super(...arguments);
		this.get('$wormholeParent').append(this.get('$wormhole'));
	},
	didInsertElement: function() {
		this.$('.picker') // move all instance of picker to the wormhole
			.detach()
			.appendTo(this.get('$wormhole'));
	},
	willDestroyElement: function() {
		this._super(...arguments);
		this.get('$wormhole').remove();
	},

	// Actions
	// -------

	actions: {
		onSelect: function(newVal) {
			// first set the interval copy of the value immediately
			// so that the picker can update ranges properly
			this.set('_value', newVal);
			// then schedule the onSelect hook to be called to update
			// the actual copy of the value. Scheduling instead of calling
			// synchronously allows Ember to appropriate space out value
			// modifications so that the same value isn't modified twice
			// in a render, triggering a multiple modification deprecation
			Ember.run.scheduleOnce('afterRender', this, function() {
				callIfPresent(this.get('onSelect'), newVal);
			});
		}
	}
});
