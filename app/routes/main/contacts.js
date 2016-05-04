import Ember from 'ember';

export default Ember.Route.extend({
	queryParams: {
		filter: {
			refreshModel: true
		},
	},
	setupController: function(controller) {
		this._super(...arguments);
		controller.set('mainModel', this.modelFor('main'));
	},
	actions: {
		didTransition: function() {
			this.controller.set('tag', null);
			this.controller.set('contacts', []);
			// don't know total until loaded
			this.controller.set('numContacts', '--');
			// return true to allow bubbling to close slideout handler
			return true;
		},
		changeFilter: function(filter) {
			this.transitionTo({
				queryParams: {
					filter: filter
				}
			})
		},
	}
});
