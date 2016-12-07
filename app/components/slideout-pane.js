import callIfPresent from '../utils/call-if-present';
import defaultIfAbsent from '../utils/default-if-absent';
import Ember from 'ember';

export default Ember.Component.extend({
	title: defaultIfAbsent(''),
	direction: defaultIfAbsent('left'),
	ignoreCloseSelectors: defaultIfAbsent(''),
	autoClose: defaultIfAbsent(true),
	focusDelay: defaultIfAbsent(500), // in ms
	focusSelector: defaultIfAbsent('.slideout-header'),
	// must explicitly include default header if has inverse
	includeDefaultHeader: defaultIfAbsent(false),

	onOpen: null,
	doClose: null,

	classNames: 'slideout-pane',
	classNameBindings: ['directionClass'],

	// Computed properties
	// -------------------

	publicAPI: Ember.computed(function() {
		return {
			id: this.elementId,
			direction: this.get('direction'),
			actions: {
				// can past as many closures to execute subsequently as we like
				close: this._close.bind(this)
			}
		};
	}),
	directionClass: Ember.computed('direction', function() {
		return `slideout-pane-${this.get('direction')}`;
	}),
	$appRoot: Ember.computed(function() {
		const rootSelector = Ember.testing ? '#ember-testing' :
			Ember.getOwner(this).lookup('application:main').rootElement;
		return Ember.$(rootSelector);
	}),

	// Events
	// ------

	didInsertElement: function() {
		if (this.get('autoClose')) {
			Ember.run.scheduleOnce('afterRender', this, function() {
				// ignore on first time to allow for click to open
				this.set('firstTime', true);
				const $el = this.$(),
					$appRoot = this.get('$appRoot'),
					$overlay = this._build$Overlay();
				// overlay
				this.set('$overlay', $overlay);
				$el.after($overlay);
				// events
				callIfPresent(this.get('onOpen'), this.get('publicAPI'));
				Ember.$(document).on(`click.${this.elementId}`, function(event) {
					if (this.get('firstTime')) {
						this.set('firstTime', false);
						return;
					}
					const ignoreCloseSelectors = this.get('ignoreCloseSelectors'),
						$target = Ember.$(event.target),
						targetStillInDOM = $appRoot.find($target).length > 0;
					if (!targetStillInDOM) {
						return;
					}
					if ($target.is($overlay)) {
						this._close();
					} else if (!$target.closest(`#${this.elementId}`).length &&
						!$target.closest(ignoreCloseSelectors).length) {
						this._close();
					}
				}.bind(this));
			});
		}
		Ember.run.later(this, function() {
			const $el = this.$();
			if ($el) {
				const focusObj = $el.find(this.get('focusSelector'));
				if (focusObj) {
					focusObj.focus();
				}
			}
		}, this.get('focusDelay'));
	},
	willDestroyElement: function() {
		this._super(...arguments);
		Ember.$(document).off(`.${this.elementId}`);
		const $overlay = this.get('$overlay');
		if ($overlay) {
			$overlay.remove();
		}

	},

	actions: {
		close: function() {
			this._close();
		}
	},

	// Private methods
	// ---------------

	_close: function(...then) {
		this.set('firstTime', true);
		callIfPresent(this.get('doClose'), this.get('publicAPI'));
		then.forEach(callIfPresent);
	},
	_build$Overlay: function() {
		const directionClass = this.get('directionClass');
		return Ember.$(`<div class='slideout-overlay ${directionClass}'></div>`);
	},
});
