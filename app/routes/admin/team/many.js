import Ember from 'ember';

export default Ember.Route.extend({
	controllerName: 'admin/people/many',
	templateName: 'admin/people/many',

	actions: {
		willTransition: function() {
			this.controller._deselectAll();
			return true;
		},
		didTransition: function() {
			if (this.controller.get('selected').length === 0) {
				this.transitionTo('admin.team');
			}
			return true; // for closing slideouts
		},
	}
});
