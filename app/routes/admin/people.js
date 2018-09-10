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
      if (!this.get('stateManager.viewingPeople') || this.get('_changedFilter')) {
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
    },
    // need to do this because a bug with context setting on action helper using `target`
    // in which flipping between tabs does not always trigger the action helper to rebuild
    // so we end up targeting the previous schedule for actions instead of the schedule
    // currently being viewed
    replaceRangeForSchedule(schedule, dayOfWeek, newRanges) {
      schedule.actions.replaceRange.call(schedule, dayOfWeek, newRanges);
    }
  },

  _resetController: function() {
    const controller = this.controller;
    controller.set('team', null);
    controller.set('people', []);
    controller.set('numPeople', '--');
    const peopleList = controller.get('_peopleList');
    if (peopleList) {
      peopleList.actions.resetPosition();
    }
  }
});
