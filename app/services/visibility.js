import Ember from 'ember';
import config from '../config/environment';

// inspired by https://github.com/wordset/visible

const {
	$,
	computed,
	guidFor,
	Evented
} = Ember;

export default Ember.Service.extend(Evented, {

	isVisible: true,
	state: 'init',

	_visibleStateName: 'visible',
	_hiddenStateName: 'hidden',

	_visbilityChangeEvent: 'visibilitychange',
	_visbilityStateName: 'visibilityState',
	_guid: computed(function() {
		return guidFor(this);
	}),

	// Events
	// ------

	init: function() {
		this._super(...arguments);
		this._handleVendorPrefix();
		this._bindEventHandlers();
		if (this._shouldFallback()) {
			this._markVisible();
		} else {
			this._checkVisibility();
		}
	},
	willDestroy: function() {
		this._super(...arguments);
		this._unbindEventHandlers();
	},

	// Setup
	// -----

	_handleVendorPrefix: function() {
		const prefixes = ['moz', 'ms', 'webkit'],
			numPrefixes = prefixes.length,
			evProp = '_visbilityChangeEvent',
			stProp = '_visbilityStateName';
		for (let i = 0; i < numPrefixes; i++) {
			const prefix = prefixes[i];
			if (document[`${prefix}Hidden`] !== undefined) {
				const st = this.get(stProp);
				this.set(evProp, prefix + this.get(evProp));
				this.set(stProp, prefix + st[0].toUpperCase() + st.slice(1));
				break;
			}
		}
	},
	_bindEventHandlers: function() {
		const guid = this.get('_guid');
		// no support for the Page Visibility API
		if (this._shouldFallback()) {
			$(window)
				.on(`blur.${guid}`, this._markHidden.bind(this))
				.on(`focus.${guid}`, this._markVisible.bind(this));
		} else {
			$(document)
				.on(`${this.get('_visbilityChangeEvent')}.${guid}`,
					this._checkVisibility.bind(this));
		}
	},
	_unbindEventHandlers: function() {
		const guid = this.get('_guid');
		Ember.$(window).off(`blur.${guid} focus.${guid}`);
		Ember.$(document).off(`${this.get('_visbilityChangeEvent')}.${guid}`);
	},

	// Helper methods
	// --------------

	_shouldFallback: function() {
		return document[this.get('_visbilityStateName')] === undefined;
	},
	_checkVisibility: function() {
		const state = document[this.get('_visbilityStateName')];
		if (state === 'visible') {
			this._markVisible();
		} else {
			this._markHidden();
		}
	},
	_markVisible: function() {
		this.set('state', this.get('_visibleStateName'));
		this.set('isVisible', true);
		this.trigger(config.events.visibility.change);
		this.trigger(config.events.visibility.visible);
	},
	_markHidden: function() {
		this.set('state', this.get('_hiddenStateName'));
		this.set('isVisible', false);
		this.trigger(config.events.visibility.change);
		this.trigger(config.events.visibility.hidden);
	}
});