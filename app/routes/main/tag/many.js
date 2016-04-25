import Ember from 'ember';

export default Ember.Route.extend({
	controllerName: 'main/contacts/many',
	templateName: 'main/contacts/many',

	setupController: function(controller) {
		this._super(...arguments);
		controller.set('tag', this.controllerFor('main.tag').get('tag'));
	},
});
