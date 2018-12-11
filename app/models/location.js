import Dirtiable from '../mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  address: { description: 'Address', validators: [validator('presence', true)] },
  lat: { description: 'Latitude', validators: [validator('number', { gt: -90, lt: 90 })] },
  lon: { description: 'Longitude', validators: [validator('number', { gt: -180, lt: 180 })] }
});

export default DS.Model.extend(Dirtiable, Validations, {
  address: DS.attr('string'),
  lat: DS.attr('number'),
  lon: DS.attr('number'),

  // Computed properties
  // -------------------

  latLng: Ember.computed('lat', 'lon', {
    get() {
      return { lat: this.get('lat'), lng: this.get('lon') };
    },
    set(key, value) {
      if (this.get('isDeleted') === false) {
        if (value) {
          this.setProperties({ lat: value.lat, lon: value.lng });
        } else {
          this.setProperties({ lat: null, lon: null });
        }
      }
      return value;
    }
  })
});
