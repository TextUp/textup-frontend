import Ember from 'ember';
import tc from 'npm:tinycolor2';
import defaultIfAbsent from '../utils/default-if-absent';

export default Ember.Component.extend({
	tagName: 'span',

	color: defaultIfAbsent('#1BA5E0'),
	content: defaultIfAbsent(''),
	contrast: defaultIfAbsent(50),
	mode: defaultIfAbsent('words'),
	onlyShowFull: defaultIfAbsent(false),

	attributeBindings: ['style'],
	classNames: 'badge',

	_hideAway: null,

	// Computed properties
	// -------------------

	complement: Ember.computed('color', function() {
		const tColor = tc(this.get('color')),
			ct = this.get('contrast'),
			complement = tColor.isLight() ? tColor.darken(ct) : tColor.lighten(ct);
		return complement.toString();
	}),
	style: Ember.computed('color', 'complement', function() {
		const color = this.get('color'),
			complement = this.get('complement');
		return Ember.String.htmlSafe(`background-color: ${color}; color:${complement}`);
	}),
	abbreviated: Ember.computed('mode', 'content', 'onlyShowFull', function() {
		if (this.get('onlyShowFull')) {
			return this.get('content');
		} else {
			return this.doAbbreviate(this.get('content'), this.get('mode'));
		}
	}),

	// Events
	// ------

	mouseEnter: function() {
		this.open();
	},
	mouseLeave: function() {
		this.close();
	},
	touchStart: function() {
		this.open();
	},
	touchEnd: function() {
		this.close();
	},
	touchCancel: function() {
		this.close();
	},

	// Helpers
	// -------

	open: function() {
		if (this.get('onlyShowFull')) {
			return;
		}
		Ember.run.cancel(this.get('_closeTimer'));
		const timer = Ember.run.later(this, this.get('_hideAway.actions.open'), 100);
		this.setProperties({
			_openTimer: timer,
			_closeTimer: null
		});
	},
	close: function() {
		if (this.get('onlyShowFull')) {
			return;
		}
		Ember.run.cancel(this.get('_openTimer'));
		const timer = Ember.run.later(this, this.get('_hideAway.actions.close'), 100);
		this.setProperties({
			_openTimer: null,
			_closeTimer: timer
		});
	},
	doAbbreviate: function(content) {
		return content.split(/\s+/).map(function(val) {
			return val[0] ? val[0] : '';
		}).join('').toUpperCase();
	}
});
