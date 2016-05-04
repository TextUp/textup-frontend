import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	address: DS.attr('string'),
	lat: DS.attr('number'),
	lon: DS.attr('number'),

	// Computed properties
	// -------------------

	latLng: Ember.computed('lat', 'lon', {
		get: function() {
			return {
				lat: this.get('lat'),
				lng: this.get('lon')
			};
		},
		set: function(key, value) {
			this.setProperties({
				lat: value.lat,
				lon: value.lng
			});
			return value;
		}
	})
});
