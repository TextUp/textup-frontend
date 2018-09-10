import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    filter: {
      refreshModel: true
    }
  },

  setupController: function() {
    this._super(...arguments);
    this._resetController();
  },

  actions: {
    didTransition: function() {
      this._super(...arguments);
      if (!this.get('stateManager.viewingContacts') || this.get('_changedFilter')) {
        this._resetController();
      }
      this.set('_changedFilter', false);
      // return true to allow bubbling to close slideout handler
      return true;
    },
    changeFilter: function(filter) {
      this.set('_changedFilter', true);
      this.transitionTo({
        queryParams: {
          filter: filter
        }
      });
    }
  },

  _resetController: function() {
    const controller = this.controller;
    controller.set('tag', null);
    controller.set('contacts', []);
    // don't know total until loaded
    controller.set('numContacts', '--');
    const contactsList = controller.get('_contactsList');
    if (contactsList) {
      contactsList.actions.resetPosition();
    }
  }
});
