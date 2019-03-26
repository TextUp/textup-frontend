import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: { filter: { refreshModel: true } },

  setupController() {
    this._super(...arguments);
    this._resetController();
  },

  actions: {
    didTransition() {
      this._super(...arguments);
      if (!this.get('stateManager.viewingPeople') || this.get('_changedFilter')) {
        this._resetController();
      }
      this.set('_changedFilter', false);
      // return true to allow bubbling to close slideout handler
      return true;
    },
    changeFilter(filter) {
      this.set('_changedFilter', true);
      this.transitionTo({
        queryParams: {
          filter: filter,
        },
      });
    },
  },

  _resetController() {
    const controller = this.controller;
    controller.set('team', null);
    controller.set('people', []);
    controller.set('numPeople', '--');
    const peopleList = controller.get('_peopleList');
    if (peopleList) {
      peopleList.actions.resetPosition();
    }
  },
});
