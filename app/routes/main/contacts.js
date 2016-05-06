import Ember from 'ember';

export default Ember.Route.extend({
	queryParams: {
		filter: {
			refreshModel: true
		},
	},
	setupController: function(controller) {
		this._super(...arguments);
		this._resetController();
	},

	actions: {
		didTransition: function() {
			const currentPath = this.controllerFor('application').get('currentPath');
			// only reset if not within main.contacts
			if (!(/main.contacts/.test(currentPath))) {
				this._resetController();
			}
			// return true to allow bubbling to close slideout handler
			return true;
		},
		changeFilter: function(filter) {
			this.transitionTo({
				queryParams: {
					filter: filter
				}
			});
		},
	},

	_resetController: function() {
		this.controller.set('tag', null);
		this.controller.set('contacts', []);
		// don't know total until loaded
		this.controller.set('numContacts', '--');
	}
});
