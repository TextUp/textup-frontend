import Ember from 'ember';
import Slideout from '../mixins/slideout-route';
import Loading from '../mixins/loading-slider';

export default Ember.Route.extend(Slideout, Loading, {

	attemptedTransition: null,

	// Events
	// ------

	init: function() {
		this._super(...arguments);
		this.notifications.setDefaultClearNotification(5000);
		this.notifications.setDefaultAutoClear(true);
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

		doTransitionAfterLogin: function() {
			const transition = this.get('attemptedTransition'),
				user = this.get('authManager.authUser');

			console.log("APP ROUTE doTransitionAfterLogin: user is");
			console.log(user);

			if (transition) {
				this.set('attemptedTransition', null);
				// avoid crashing if don't provide enough parameters to transition
				try {
					console.log('branch 1');
					transition.retry();
				} catch (err) {
					console.log('branch 2');
					this.transitionTo('main', user);
				}
			} else {
				console.log('branch 3');
				this.transitionTo('main', user);
			}
		},
		storeAttemptedTransition: function(transition) {
			this.set('attemptedTransition', transition);
		},
		logout: function() {
			this.get('authManager').logout();
			this.transitionTo('index');
		},

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

		// Errors
		// ------

		error: function(reason, transition) {
			const dataHandler = this.get('dataHandler');
			if (reason.status === 0) {
				this.notifications.error(`Sorry, but we\'re having trouble
					connecting to the server. This problem is usually the
					result of a broken Internet connection. You can try
					refreshing this page.`);
			} else if (dataHandler.checkForStatus(reason, 401)) {
				this.set("attemptedTransition", transition);
				transition.send('logout');
			} else if (transition.targetName === 'main.index' &&
				dataHandler.checkForStatus(reason, 404)) {
				transition.send('logout');
			} else {
				console.log("ERROR: " + JSON.stringify(reason));
			}
		}
	}
});
