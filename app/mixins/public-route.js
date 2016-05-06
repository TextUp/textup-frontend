import Ember from 'ember';
import Loading from '../mixins/loading-slider';

export default Ember.Mixin.create(Loading, {
	beforeModel: function() {
		this._super(...arguments);
		if (this.get('authManager.isLoggedIn')) {
			this.transitionTo("main", this.get('authManager.authUser'));
		}
	}
});
