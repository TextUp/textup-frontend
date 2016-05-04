import Auth from '../mixins/auth-route';
import Ember from 'ember';
import Slideout from '../mixins/slideout-route';

export default Ember.Route.extend(Slideout, Auth, {
	slideoutOutlet: 'details-slideout',

	beforeModel: function() {
		this._super(...arguments);
		if (!this.get('authManager.authUser.isAdmin')) {
			this.transitionTo('main');
		}
	},
	model: function() {
		console.log("ADMIN MODEL HOOK!");
	},
	actions: {
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
