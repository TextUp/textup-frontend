import * as ArrayUtils from 'textup-frontend/utils/array';
import * as ErrorUtils from 'textup-frontend/utils/error';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { RSVP, isArray } = Ember;

export default Ember.Service.extend({
  notifications: Ember.inject.service(),
  loadingSlider: Ember.inject.service(),
  authService: Ember.inject.service(),
  router: Ember.inject.service(),

  persist(data) {
    return new RSVP.Promise((resolve, reject) => {
      const changedModels = ArrayUtils.ensureArray(data)
        .filterBy('isDirty')
        .uniq(); // uniq so we don't send duplicate requests
      if (Ember.isEmpty(changedModels)) {
        return resolve(data);
      }
      this.get('loadingSlider').startLoading();
      this.request(RSVP.all(changedModels.map(model => model.save())))
        .then(success => resolve(isArray(data) ? success : success[0]))
        .finally(() => this.get('loadingSlider').endLoading());
    });
  },

  markForDelete(data) {
    ArrayUtils.ensureArray(data).forEach(model => {
      if (model.get('isNew')) {
        model.rollbackAttributes();
      } else {
        model.deleteRecord();
      }
    });
  },

  request(promise) {
    return new RSVP.Promise((resolve, reject) => {
      if (promise instanceof RSVP.Promise) {
        promise.then(resolve, failureObj => {
          this.handleError(failureObj);
          reject(failureObj);
        });
      } else {
        resolve(promise);
      }
    });
  },

  handleMapError() {
    this.get('notifications').error(
      `Sorry! We are having trouble loading the map. Please try again.`
    );
  },

  handleError(failureObj) {
    this._tryHandleResponseError(failureObj);
    Ember.debug('dataService.handleError: ' + failureObj);
  },

  // Internal handlers
  // -----------------

  _tryHandleResponseError(failureObj) {
    if (ErrorUtils.isResponse(failureObj)) {
      if (ErrorUtils.isResponseStatus(failureObj, Constants.RESPONSE_STATUS.UNAUTHORIZED)) {
        this.get('authService').logout();
        this.get('notifications').info('Please log in first.');
      } else if (ErrorUtils.isResponseStatus(failureObj, Constants.RESPONSE_STATUS.NOT_FOUND)) {
        this.get('router').transitionTo('index');
      } else if (ErrorUtils.isResponseStatus(failureObj, Constants.RESPONSE_STATUS.TIMED_OUT)) {
        this.get('notifications').error(
          `Sorry, we're having trouble connecting to the server. This problem is usually the result of a broken Internet connection. You can try refreshing this page.`,
          { clearDuration: 10000 }
        );
      } else {
        ErrorUtils.tryExtractResponseMessages(failureObj).forEach(message => {
          this.get('notifications').error(message);
        });
      }
    }
  },
});
