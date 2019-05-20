import { Promise } from 'rsvp';
import Component from '@ember/component';

export default Component.extend({
  location: null,
  description: null,

  actions: {
    onSelect(latLng, description) {
      return new Promise(
        function(resolve) {
          const { lat, lng } = latLng;
          // deconstruct property or else we remove the computed property association
          // and instead replace the computed property with the Mapbox LatLng object
          this.setProperties({
            location: {
              lat,
              lng,
            },
            description: description,
          });
          resolve();
        }.bind(this)
      );
    },
    onDeselect() {
      return new Promise(
        function(resolve) {
          this.setProperties({
            location: null,
            description: null,
          });
          resolve();
        }.bind(this)
      );
    },
  },
});
