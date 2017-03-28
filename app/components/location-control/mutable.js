import Ember from 'ember';

export default Ember.Component.extend({
	location: null,
	description: null,

	actions: {
		onSelect: function(latLng, description) {
			return new Ember.RSVP.Promise(function(resolve) {
				const {
					lat,
					lng
				} = latLng;
				// deconstruct property or else we remove the computed property association
				// and instead replace the computed property with the Mapbox LatLng object
				this.setProperties({
					location: {
						lat,
						lng
					},
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