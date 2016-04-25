import Ember from 'ember';

export default Ember.Route.extend({
	controllerName: 'main/contacts/contact',
	templateName: 'main/contacts/contact',

	setupController: function(controller) {
		this._super(...arguments);
		controller._loadInitialRecords();
		controller.set('tag', this.controllerFor('main.tag').get('tag'));
	},
});
