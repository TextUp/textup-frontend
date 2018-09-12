import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    token: {
      refreshModel: true
    }
  },
  errors: null,

  // Events
  // ------

  model: function(params) {
    this._super(...arguments);
    const token = params.token;
    if (token) {
      return this.store.findRecord('notification', token).then(
        success => {
          this.set('errors', null);
          return success;
        },
        failure => {
          this.set('errors', failure.errors);
        }
      );
    } else {
      this.notifications.error('No authorization token specified.');
      this.transitionTo('login');
    }
  },
  setupController: function(controller) {
    this._super(...arguments);
    controller.set('errors', this.get('errors'));
  },
  deactivate: function() {
    this.set('errors', null);
    this.controller.set('errors', null);
  },

  // Actions
  // -------

  actions: {
    openInApp: function(notification) {
      const ownerUrlId = notification.get('ownerUrlIdentifier'),
        otherUrlId = notification.get('otherUrlIdentifier'),
        isOtherTag = notification.get('isOtherTag');
      if (isOtherTag) {
        this.transitionTo('main.tag.details', ownerUrlId, otherUrlId);
      } else {
        this.transitionTo('main.contacts.contact', ownerUrlId, otherUrlId);
      }
    }
  }
});
