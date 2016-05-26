import Ember from 'ember';

export default Ember.Mixin.create({
	beforeModel: function() {
		this._super(...arguments);
		const user = this.get('authManager.authUser');
		if (!Ember.isPresent(user.get('personalPhoneNumber'))) {
			this.transitionTo('setup');
		}
	},
});
