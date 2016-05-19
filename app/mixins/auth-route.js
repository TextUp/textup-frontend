import Ember from 'ember';
import Loading from '../mixins/loading-slider';

export default Ember.Mixin.create(Loading, {
	beforeModel: function(transition) {
		this._super(...arguments);
		const auth = this.get('authManager');
		if (!auth.get('isLoggedIn')) {
			auth.set('attemptedTransition', transition);
			this.notifications.info('Please log in first.');
			this.transitionTo("login");
		}
	},
});
