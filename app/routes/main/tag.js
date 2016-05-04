import Ember from 'ember';

export default Ember.Route.extend({
	controllerName: 'main/contacts',
	templateName: 'main/contacts',

	serialize: function(model) {
		return {
			tag_identifier: model.get('urlIdentifier')
		};
	},
	model: function(params) {
		const id = params.tag_identifier,
			tags = this.modelFor('main').get('tags'),
			tag = tags.findBy('urlIdentifier', id);
		if (tag) {
			return tag;
		} else {
			this.transitionTo('main.contacts');
		}
	},
	setupController: function(controller, tag) {
		this._super(...arguments);
		controller.set('tag', tag);
		controller.set('contacts', []);
		controller.set('numContacts', tag.get('numMembers'));

	},

	actions: {
		changeFilter: function(filter) {
			this.transitionTo('main.contacts', {
				queryParams: {
					filter: filter
				}
			});
		},
	}
});
