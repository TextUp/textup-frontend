import Ember from 'ember';
import config from 'textup-frontend/config/environment';
import { format } from 'textup-frontend/utils/phone-number';

export default Ember.Service.extend({
  authService: Ember.inject.service(),
  dataService: Ember.inject.service(),
  notifications: Ember.inject.service(),
  stateManager: Ember.inject.service('state'),
  store: Ember.inject.service(),

  loadStaffForSharing: function(model) {
    const shareQuery = Object.create(null);
    shareQuery.max = 100;
    shareQuery.status = ['STAFF', 'ADMIN'];
    if (model.get('constructor.modelName') === 'team') {
      shareQuery.teamId = model.get('id');
    } else {
      shareQuery.canShareStaffId = model.get('id');
    }
    this.get('store')
      .query('staff', shareQuery)
      .then(result => {
        this.get('stateManager').set('relevantStaffs', result.toArray());
      }, this.get('dataService').buildErrorHandler());
  },

  startVerifyPersonalPhone(num) {
    return this.get('authService')
      .authRequest({
        type: 'POST',
        url: `${config.host}/v1/numbers`,
        data: JSON.stringify({ phoneNumber: num })
      })
      .then(
        () => this.get('notifications').info(`Sent verification text to ${format(num)}`),
        this.get('dataService').buildErrorHandler()
      );
  },
  finishVerifyPersonalPhone(num, validationCode) {
    const notifications = this.get('notifications');
    return this.get('authService')
      .authRequest({
        type: 'POST',
        url: `${config.host}/v1/numbers`,
        data: JSON.stringify({ phoneNumber: num, token: validationCode })
      })
      .then(
        () => notifications.success(`Successfully validated ${format(num)}`),
        failure => {
          if (this.get('dataService').displayErrors(failure) === 0) {
            notifications.error(`Invalid or expired token for ${format(num)}`);
          }
        }
      );
  }
});
