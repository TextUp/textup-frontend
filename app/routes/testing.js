import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    registerTourManager(tourManager) {
      // check if tour needs to start
      if (tourManager.startTourImmediately) {
        Ember.run.scheduleOnce('afterRender', tourManager.actions.startTour);
      }
    }
  }
});
