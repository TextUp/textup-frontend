import Ember from 'ember';

export default Ember.Route.extend({
	setupController: function(controller) {
		this._super(...arguments);
		controller.loadInitial();
		controller.set('team', null);
	}
});
