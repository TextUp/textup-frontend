import Ember from 'ember';
import Slideout from '../mixins/slideout-route';
import Loading from '../mixins/loading-slider';
import callIfPresent from '../utils/call-if-present';

export default Ember.Route.extend(Slideout, Loading, {

	attemptedTransition: null,
	storage: Ember.inject.service(),

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
		// validate stored token for staff, if any
		// return promise so that resolver blocks until promise completes
		// catch any error to avoid default error handler if promise
		// rejects when the staff is not logged in
		return this.get('authManager').setupFromStorage().catch(() => {});
	},
	redirect: function() {
		const url = this.get('storage').getItem('currentUrl');
		// initialize the observer after retrieving the previous currentUrl
		this.get('stateManager').trackLocation();
		if (url) {
			this.transitionTo(url);
		}
	},

	actions: {
		validate: function(un, pwd, then = undefined) {
			return this.get('authManager').validate(un, pwd).then(() => {
				callIfPresent(then);
			}, (failure) => {
				if (this.get('dataHandler').displayErrors(failure) === 0) {
					this.notifications.error('Could not validate credentials');
				}
			});
		},
		logout: function() {
			this.get('authManager').logout();
		},

		// Slideout
		// --------

		didTransition: function() {
			if (!this.get('_initialized')) {
				Ember.run.next(this, function() {
					const $initializer = Ember.$('#initializer');
					$initializer.fadeOut('fast', () => {
						$initializer.remove();
						this.set('_initialized', true);
					});
				});
			}
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

		clearList: function(models, propName, ...then) {
			this._doForOneOrMany(models, (model) => model.get(propName).clear());
			then.forEach(callIfPresent);
		},
		revert: function(models, ...then) {
			this._doForOneOrMany(models, (model) => model && model.rollbackAttributes());
			then.forEach(callIfPresent);
		},
		persist: function(models, ...then) {
			return this.get('dataHandler')
				.persist(models)
				.then(() => then.forEach(callIfPresent));
		},
		markForDelete: function(models, ...then) {
			this.get('dataHandler').markForDelete(models);
			then.forEach(callIfPresent);
		},

		// Errors
		// ------

		mapError: function() {
			this.notifications.error(`Sorry! We are having trouble loading
				the map. Please try again.`);
		},
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
