import Ember from 'ember';

export default Ember.Route.extend({
	setupController: function(controller) {
		this._super(...arguments);
		const org = this.store.createRecord('organization', {
			location: this.store.createRecord('location')
		});
		controller.set('org', org);
		// set next so that setting select is not overwritten
		// by the setup process, which sets selected to null
		Ember.run.next(this, function() {
			this.controllerFor('signup').set('selected', org);
		});
	},
});
