import Ember from 'ember';

export default Ember.Route.extend({
	controllerName: 'admin/people/person',
	templateName: 'admin/people/person',

	setupController: function(controller) {
		this._super(...arguments);
		controller.set('team', this.controllerFor('admin.people').get('team'));
	},
});
