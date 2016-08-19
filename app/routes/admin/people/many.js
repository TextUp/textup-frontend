import Ember from 'ember';

export default Ember.Route.extend({
	actions: {
		willTransition: function() {
			this.controller._deselectAll();
			return true;
		},
		didTransition: function() {
			if (this.controller.get('selected').length === 0) {
				this.transitionTo('admin.people');
			}
			return true; // for closing slideouts
		},
	}
});
