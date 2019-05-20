import { computed } from '@ember/object';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  address: { description: 'Address', validators: [validator('presence', true)] },
  lat: { description: 'Latitude', validators: [validator('number', { gt: -90, lt: 90 })] },
  lng: { description: 'Longitude', validators: [validator('number', { gt: -180, lt: 180 })] },
});

export default DS.Model.extend(Dirtiable, Validations, {
  address: DS.attr('string'),
  lat: DS.attr('number'),
  lng: DS.attr('number'),

  // Computed properties
  // -------------------

  latLng: computed('lat', 'lng', {
    get() {
      return { lat: this.get('lat'), lng: this.get('lng') };
    },
    set(key, value) {
      if (this.get('isDeleted') === false) {
        if (value) {
          this.setProperties({ lat: value.lat, lng: value.lng });
        } else {
          this.setProperties({ lat: null, lng: null });
        }
      }
      return value;
    },
  }),
});
