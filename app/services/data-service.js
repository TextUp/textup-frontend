import callIfPresent from 'textup-frontend/utils/call-if-present';
import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  notifications: Ember.inject.service(),
  loadingSlider: Ember.inject.service(),
  authService: Ember.inject.service(),
  router: Ember.inject.service(),

  persist: function(data) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const isArray = Ember.isArray(data),
        models = isArray ? data : [data],
        changedModels = models.filterBy('isDirty').uniq(); // uniq so we don't send duplicate requests
      if (Ember.isEmpty(changedModels)) {
        return resolve(data);
      }
      // start loading
      this.get('loadingSlider').startLoading();
      Ember.RSVP
        .all(changedModels.map(model => model.save()))
        .then(success => resolve(isArray ? success : success[0]))
        .catch(this.buildErrorHandler(reject))
        .finally(() => this.get('loadingSlider').endLoading());
    });
  },
  markForDelete: function(data) {
    const models = Ember.isArray(data) ? data : [data];
    models.forEach(model => {
      if (model.get('isNew')) {
        model.rollbackAttributes();
      } else {
        model.deleteRecord();
      }
    });
  },

  buildErrorHandler: function(then = undefined) {
    return function(failure) {
      this.handleError(failure);
      callIfPresent(this, then, [failure]);
    }.bind(this);
  },
  handleMapError() {
    this.notifications.error(`Sorry! We are having trouble loading the map. Please try again.`);
  },
  handleError: function(failure) {
    // log out if unauthorized
    if (this.checkForStatus(failure, 401)) {
      this.get('authService').logout();
      this.notifications.info('Please log in first.');
    } else if (this.checkForStatus(failure, 404)) {
      this.get('router').transitionTo('index');
    } else if (this.checkForStatus(failure, 0)) {
      this.notifications.error(
        `Sorry, we're having trouble connecting to the server. This problem is usually the
        result of a broken Internet connection. You can try refreshing this page.`,
        { clearDuration: 10000 }
      );
    } else if (this.displayErrors(failure) === 0) {
      this.notifications.error(
        `Could not perform action. Please try again later. The error is: ${failure}`,
        { clearDuration: 10000 }
      );
      Ember.debug('data.handleError: unspecified error: ' + failure);
    }
  },

  // Utility methods
  // ---------------

  displayErrors: function(json) {
    const failure = json.responseJSON || json;
    let numMessages = 0;
    if (failure && failure.errors) {
      failure.errors
        .mapBy('message')
        .uniq()
        .forEach(msg => {
          if (msg) {
            this.notifications.error(msg);
            numMessages++;
          }
        });
    }
    return numMessages;
  },
  checkForStatus: function(failure, status) {
    return (
      failure === status ||
      (failure && failure.errors && failure.errors[0] && failure.errors[0].status === `${status}`)
    );
  }
});
