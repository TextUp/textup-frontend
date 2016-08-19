import Ember from 'ember';

export default Ember.Route.extend({
	controllerName: 'main/contacts/many',
	templateName: 'main/contacts/many',

	actions: {
		willTransition: function() {
			this.controller._deselectAll();
			return true;
		},
		didTransition: function() {
			if (this.controller.get('selected').length === 0) {
				this.transitionTo('main.tag');
			}
			return true; // for closing slideouts
		},
	}
});
