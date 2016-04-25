import Ember from 'ember';

export default Ember.Route.extend({
	controllerName: 'main/contacts',
	templateName: 'main/contacts',

	setupController: function(controller) {
		this._super(...arguments);
		controller._resetContactsToInitial();
		controller.set('tag', {
			id: 4,
			color: "#dd3",
			numMembers: 4,
			identifier: "Woman's Collective Interest Group",
			type: 'tag',
			name: "Woman's Collective Interest Group",
			actions: []
		});
	},
});
