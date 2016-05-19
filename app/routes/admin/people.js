import Ember from 'ember';

export default Ember.Route.extend({
	queryParams: {
		filter: {
			refreshModel: true
		},
	},

	setupController: function() {
		this._super(...arguments);
		this._resetController();
	},

	actions: {
		didTransition: function() {
			if (!this.get('stateManager.viewingPeople') ||
				this.get('_changedFilter')) {
				this._resetController();
			}
			this.set('_changedFilter', false);
			// return true to allow bubbling to close slideout handler
			return true;
		},
		changeFilter: function(filter) {
			this.set('_changedFilter', true);
			this.transitionTo({
				queryParams: {
					filter: filter
				}
			});
		},
	},

	_resetController: function() {
		this.controller.set('team', null);
		this.controller.set('people', []);
		this.controller.set('numPeople', '--');
	}
});
