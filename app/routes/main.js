import Auth from '../mixins/auth-route';
import Ember from 'ember';
import Slideout from '../mixins/slideout-route';

export default Ember.Route.extend(Slideout, Auth, {
	slideoutOutlet: 'details-slideout',

	beforeModel: function() {
		this._super(...arguments);
		const user = this.get('authManager.authUser');

		console.log("MAIN BEFORE MODEL HOOK!");

		if (user.get('isAdmin')) {
			this.transitionTo('admin');
		} else {
			return user.get('isNone').then((isNone) => {
				if (isNone) {
					this.transitionTo('none');
				}
			});
		}
	},
	serialize: function(model) {
		return {
			main_identifier: model.get('urlIdentifier')
		};
	},
	model: function(params) {
		console.log("MAIN MODEL HOOK!");

		const id = params.main_identifier,
			user = this.get('authManager.authUser');
		if (id === user.get('urlIdentifier')) {

			console.log("main model branch 1");

			return user;
		} else {
			return user.get('teamsWithPhones').then((teams) => {
				const team = teams.findBy('urlIdentifier', id);
				if (team) {

					console.log("main model branch 2");

					return team;
				} else if (user.get('isAdmin')) {

					console.log("main model branch 3");

					this.transitionTo('admin');
				} else {

					console.log("main model branch 4");

					this.send('logout');
				}
			});
		}
	},
	redirect: function(model, transition) {
		if (transition.targetName === 'main.index') {


			console.log("MAIN MODEL REDIRECT to main.contacts");


			this.transitionTo('main.contacts');
		}
	},
	actions: {

		updateStaff: function() {
			console.log('updateStaff');
			return false;
		},

		// Slideout
		// --------

		didTransition: function() {
			this._closeSlideout();
			return true;
		},
		toggleDetailSlideout: function(name, context) {
			this._toggleSlideout(name, context);
		},
		openDetailSlideout: function(name, context) {
			this._openSlideout(name, context);
		},
		closeSlideout: function() {
			this._closeSlideout();
			return true;
		},
	}
});
