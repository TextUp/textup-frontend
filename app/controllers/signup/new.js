import Ember from 'ember';

export default Ember.Controller.extend({
	location: null,
	address: null,

	actions: {
		mapError: function() {
			this.notifications.error('Something went wrong when finding the location. Please try again.');
		}
	}
});
