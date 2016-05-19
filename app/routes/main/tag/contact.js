import MainContactsContactRoute from '../contacts/contact';

export default MainContactsContactRoute.extend({
	controllerName: 'main/contacts/contact',
	templateName: 'main/contacts/contact',

	model: function(params) {
		const id = params.id;
		if (id) {
			this.set('_id', id);
			const found = this.store.peekRecord('contact', id);
			return found ? found : this.store.findRecord('contact', id);
		} else {
			this.transitionTo('main.tag');
		}
	},
	setupController: function(controller) {
		this._super(...arguments);
		controller.set('tag', this.controllerFor('main.tag').get('tag'));
	},
});
