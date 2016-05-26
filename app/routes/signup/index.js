import Ember from 'ember';

export default Ember.Route.extend({
	activate: function() {
		const signupController = this.controllerFor('signup'),
			selected = signupController.get('selected');
		// need to rollback if coming from create new org
		if (selected && selected.get('isNew')) {
			selected.get('location.content').rollbackAttributes();
			selected.rollbackAttributes();
			signupController.set('selected', null);
		}
	},
});
