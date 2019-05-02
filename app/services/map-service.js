import Ember from 'ember';

export const MAP_ERROR_MSG = 'Sorry! We are having trouble loading the map. Please try again.';

export default Ember.Service.extend({
  notifications: Ember.inject.service(),

  handleError() {
    this.get('notifications').error(MAP_ERROR_MSG);
  },
});
