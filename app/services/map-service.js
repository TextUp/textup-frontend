import Service, { inject as service } from '@ember/service';

export const MAP_ERROR_MSG = 'Sorry! We are having trouble loading the map. Please try again.';

export default Service.extend({
  notifications: service('notification-messages-service'),

  handleError() {
    this.get('notifications').error(MAP_ERROR_MSG);
  },
});
