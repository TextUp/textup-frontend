import Ember from 'ember';

export default Ember.Route.extend({
	_id: null,

	model: function(params) {
		const id = params.id;
		if (id) {
			this.set('_id', id);
			const found = this.store.peekRecord('staff', id);
			return found ? found : this.store.findRecord('staff', id);
		} else {
			this.transitionTo('admin.people');
		}
	},
	setupController: function(controller, model) {
		this._super(...arguments);
		controller.set('person', model);
		controller.set('team', null);
	},
});
