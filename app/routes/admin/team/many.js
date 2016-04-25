import Ember from 'ember';

export default Ember.Route.extend({
	controllerName: 'admin/people/many',
	templateName: 'admin/people/many',

	setupController: function(controller) {
		this._super(...arguments);
		controller.set('team', this.controllerFor('admin.people').get('team'));
	},
});
