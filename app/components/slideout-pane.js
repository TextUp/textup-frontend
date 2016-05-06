import Ember from 'ember';
import defaultIfAbsent from '../utils/default-if-absent';

export default Ember.Component.extend({
	title: defaultIfAbsent(''),
	closeActionName: defaultIfAbsent(null),
	closeActionParameters: defaultIfAbsent([]),
	direction: defaultIfAbsent('left'),
	ignoreCloseSelectors: defaultIfAbsent(''),
	autoClose: defaultIfAbsent(true),
	focusDelay: defaultIfAbsent(500), // in ms
	focusSelector: defaultIfAbsent('.slideout-header'),
	// must explicitly include default header if has inverse
	includeDefaultHeader: defaultIfAbsent(false),

	classNames: 'slideout-pane',
	classNameBindings: ['directionClass'],

	// Computed properties
	// -------------------

	publicAPI: Ember.computed(function() {
		return {
			id: this.elementId,
			direction: this.get('direction'),
			actions: {
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
				Ember.$(document).on(`click.${this.elementId}`, function(event) {
					if (this.get('firstTime')) {
						this.set('firstTime', false);
						return;
					}
					const ignoreCloseSelectors = this.get('ignoreCloseSelectors'),
						$target = Ember.$(event.target),
						targetStillInDOM = this.get('$appRoot').find($target).length > 0;
					if (!targetStillInDOM) {
						return;
					}
					if (!$target.closest(`#${this.elementId}`).length &&
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
		Ember.$(document).off(`.${this.elementId}`);
	},

	actions: {
		close: function() {
			this._close();
			return false;
		}
	},

	// Private methods
	// ---------------

	_close: function() {
		this.firstTime = true;
		const params = this.get('closeActionParameters');
		if (Ember.isPresent(params)) {
			if (Ember.isArray(params)) {
				this.sendAction('closeActionName', ...params);
			} else {
				this.sendAction('closeActionName', params);
			}
		} else {
			this.sendAction('closeActionName');
		}
	}
});
