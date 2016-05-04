import Ember from 'ember';
import Loading from '../mixins/loading-slider';

export default Ember.Mixin.create(Loading, {
	beforeModel: function(transition) {
		this._super(...arguments);
		if (!this.get('authManager.isLoggedIn')) {
			transition.send("storeAttemptedTransition", transition);
			this.notifications.info('Please log in first.');
			this.transitionTo("login");
		}
	},
});
