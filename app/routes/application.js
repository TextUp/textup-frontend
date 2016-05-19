import Ember from 'ember';
import Slideout from '../mixins/slideout-route';
import Loading from '../mixins/loading-slider';
import callIfPresent from '../utils/call-if-present';

export default Ember.Route.extend(Slideout, Loading, {

	attemptedTransition: null,

	// Events
	// ------

	init: function() {
		this._super(...arguments);
		this.notifications.setDefaultClearNotification(5000);
		this.notifications.setDefaultAutoClear(true);
	},
	setupController: function() {
		this._super(...arguments);
	},

	// Hooks
	// -----

	beforeModel: function() {
		console.log("APPLICATION BEFORE MODEL HOOK!");
		console.log(this.get('authManager'));
		// validate stored token for staff, if any
		// if credential invalid or missing, clear and go to login
		return this.get('authManager').setupFromStorage().catch(() => {
			console.log("APP ROUTE BEFORE MODEL NOT LOGGED IN!");
			this.transitionTo('login');
		});
	},

	actions: {

		// Slideout
		// --------

		didTransition: function() {
			this._closeSlideout();
		},
		toggleSlideout: function(name, context) {
			this._toggleSlideout(name, context);
		},
		openSlideout: function(name, context) {
			this._openSlideout(name, context);
		},
		closeSlideout: function() {
			this._closeSlideout();
		},

		// Slideout utilities
		// ------------------

		clearList: function(models, propName, then) {
			this._doForOneOrMany(models, (model) => model.get(propName).clear());
			callIfPresent(then);
		},
		revert: function(models, then) {
			this._doForOneOrMany(models, (model) => model.rollbackAttributes());
			callIfPresent(then);
		},
		persist: function(models, then) {
			this.get('dataHandler')
				.persist(models)
				.then(() => callIfPresent(then));
		},
		markForDelete: function(models, then) {
			this.get('dataHandler').markForDelete(models);
			callIfPresent(then);
		},

		// Errors
		// ------

		error: function(reason, transition) {
			this.get('authManager').set("attemptedTransition", transition);
			this.get('dataHandler').handleError(reason);
		}
	},

	// Helpers
	// -------

	_doForOneOrMany: function(data, doAction) {
		if (Ember.isArray(data)) {
			return data.forEach(doAction);
		} else {
			return doAction(data);
		}
	},
});
