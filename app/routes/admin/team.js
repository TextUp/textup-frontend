import Ember from 'ember';

export default Ember.Route.extend({
	controllerName: 'admin/people',
	templateName: 'admin/people',

	setupController: function(controller) {
		this._super(...arguments);
		controller.loadInitial();
		controller.set('team', {
			id: 8,
			name: "Housing First",
			numMembers: 9,
			color: "orange",
			phone: '291 392 8888',
			latLng: {
				lat: 34.0522,
				lng: -118.2437
			},
			address: '888 Miracle Mile, Los Angeles, CA 91745'
		});
	},
});
