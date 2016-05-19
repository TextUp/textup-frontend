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
		this.set('tag', tag);
		controller.set('tag', tag);
		this._resetController(tag);
	},

	actions: {
		didTransition: function() {
			if (!this.get('stateManager.viewingTag')) {
				this._resetController(this.get('tag'));
			}
			// return true to allow bubbling to close slideout handler
			return true;
		},
		changeFilter: function(filter) {
			this.transitionTo('main.contacts', {
				queryParams: {
					filter: filter
				}
			});
		},
	},

	_resetController: function(tag) {
		this.controller.set('contacts', []);
		this.controller.set('numContacts', tag.get('numMembers'));
	},
});
