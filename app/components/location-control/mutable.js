import Ember from 'ember';

export default Ember.Component.extend({
	location: null,
	description: null,

	actions: {
		onSelect: function(latLng, description) {
			return new Ember.RSVP.Promise(function(resolve) {
				this.setProperties({
					location: latLng,
					description: description
				});
				resolve();
			}.bind(this));
		},
		onDeselect: function() {
			return new Ember.RSVP.Promise(function(resolve) {
				this.setProperties({
					location: null,
					description: null
				});
				resolve();
			}.bind(this));
		},
	}
});
