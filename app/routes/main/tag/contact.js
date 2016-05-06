import Ember from 'ember';

export default Ember.Route.extend({
	controllerName: 'main/contacts/contact',
	templateName: 'main/contacts/contact',

	model: function(params) {
		const id = params.id;
		if (id) {
			return this.store.find('contact', id);
		} else {
			this.transitionTo('main.tag');
		}
	},
	setupController: function(controller, model) {
		this._super(...arguments);
		this.controller.set('contact', model);
		this.controller.set('tag', this.controllerFor('main.tag').get('tag'));
	},

	actions: {
		didTransition: function() {
			this.controller.set('records', []);
			// don't know until loaded
			this.controller.set('totalNumRecords', '--');
			return true;
		},
	}
});
