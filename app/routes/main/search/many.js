import Ember from 'ember';

export default Ember.Route.extend({
	templateName: 'main/contacts/many',

	actions: {
		willTransition: function() {
			this.controller._deselectAll();
			return true;
		},
		didTransition: function() {
			if (this.controller.get('selected').length === 0) {
				this.transitionTo('main.search');
			}
			return true; // for closing slideouts
		},
	}
});
