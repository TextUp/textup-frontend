import DS from 'ember-data';
import Ember from 'ember';
import {
	validator,
	buildValidations
} from 'ember-cp-validations';

const Validations = buildValidations({
	address: {
		description: 'Address',
		validators: [
			validator('presence', true)
		]
	},
	lat: {
		description: 'Latitude',
		validators: [
			validator('number', {
				gt: -90,
				lt: 90
			})
		]
	},
	lon: {
		description: 'Longitude',
		validators: [
			validator('number', {
				gt: -180,
				lt: 180
			})
		]
	}
});

export default DS.Model.extend(Validations, {
	address: DS.attr('string'),
	lat: DS.attr('number'),
	lon: DS.attr('number'),

	// Computed properties
	// -------------------

	latLng: Ember.computed('lat', 'lon', {
		get: function() {
			const lat = this.get('lat'),
				lng = this.get('lon');
			return (Ember.isPresent(lat) && Ember.isPresent(lng)) ? {
				lat: this.get('lat'),
				lng: this.get('lon')
			} : null;
		},
		set: function(key, value) {
			if (this.get("isDeleted") === false) {
				if (value) {
					this.setProperties({
						lat: value.lat,
						lon: value.lng
					});
				} else {
					this.setProperties({
						lat: null,
						lon: null
					});
				}
			}
			return value;
		}
	})
});