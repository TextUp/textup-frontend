import Ember from 'ember';
import Slideout from '../mixins/slideout-route';
import Loading from '../mixins/loading-slider';
import callIfPresent from '../utils/call-if-present';
import config from '../config/environment';

const {
	$
} = Ember;

export default Ember.Route.extend(Slideout, Loading, {

	attemptedTransition: null,
	storage: Ember.inject.service(),

	// Events
	// ------

	init: function() {
		this._super(...arguments);
		this.notifications.setDefaultClearNotification(5000);
		this.notifications.setDefaultAutoClear(true);
		this.get('authManager')
			.on(config.events.auth.success, this, this._bindLockOnHidden)
			.on(config.events.auth.clear, this, this._clearLockOnHidden);
	},
	willDestroy: function() {
		this._super(...arguments);
		this.get('authManager')
			.off(config.events.auth.success, this)
			.off(config.events.auth.clear, this);
	},

	// Hooks
	// -----

	setupController: function(controller) {
		this._super(...arguments);
		controller.set('lockCode', '');
		if (this.get('authManager.isLoggedIn')) {
			this.doLock();
		}
	},
	beforeModel: function() {
		// validate stored token for staff, if any
		// return promise so that resolver blocks until promise completes
		// catch any error to avoid default error handler if promise
		// rejects when the staff is not logged in
		return this.get('authManager').setupFromStorage().catch(() => {});
	},
	redirect: function(model, transition) {
		const storage = this.get('storage'),
			url = storage.getItem('currentUrl');
		// initialize the observer after retrieving the previous currentUrl
		this.get('stateManager').trackLocation();
		// redirect only if previous url present and the target
		// route is not '/reset' or '/setup'
		const targetName = transition.targetName;
		if (targetName.indexOf('reset') === -1 &&
			targetName.indexOf('setup') === -1 && url) {
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

		// Lock
		// ----

		updateLockCode: function(code) {
			this.controller.set('lockCode', code);
		},
		verifyLockCode: function(code) {
			return new Ember.RSVP.Promise((resolve, reject) => {
				const un = this.get('authManager.authUser.username');
				this.get('authManager').validateLockCode(un, code).then(() => {
					this.doUnlock();
					resolve();
				}, () => {
					this.notifications.error('Incorrect lock code.');
					reject();
				}).finally(() => this.controller.set('lockCode', ''));
			});
		},

		// Slideout
		// --------

		willTransition: function(transition) {
			// forbid transitions when locked
			if (this.controller.get('isLocked')) {
				transition.abort();
				// Manual fix for the problem of URL getting out of sync
				// when pressing the back button even though we are aborting
				// the transition.
				// http://stackoverflow.com/questions/17738923/
				// 		url-gets-updated-when-using-transition-
				// 		abort-on-using-browser-back
				if (window.history) {
					window.history.forward();
				}
			}
		},
		didTransition: function() {
			// initializer
			if (!this.get('_initialized')) {
				Ember.run.next(this, function() {
					const $initializer = Ember.$('#initializer');
					$initializer.fadeOut('fast', () => {
						$initializer.remove();
						this.set('_initialized', true);
					});
				});
			}
			// lock screen
			this.controller.set('lockCode', '');
			// slideout
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

	// Lock helpers
	// ------------

	doLock: function() {
		if (!config.lock.lockOnHidden) {
			return;
		}
		this.controller.set('isLocked', true);
		Ember.run.scheduleOnce('afterRender', this, function() {
			$('#container .lock-control').focus();
		});
	},
	doUnlock: function() {
		this.controller.set('isLocked', false);
	},
	_bindLockOnHidden: function() {
		this.get('visibility').on(config.events.visibility.hidden, this, this.doLock);
	},
	_clearLockOnHidden: function() {
		this.get('visibility').off(config.events.visibility.hidden, this);
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
