import config from 'textup-frontend/config/environment';
import Ember from 'ember';

const { computed, get, run } = Ember;

export default Ember.Controller.extend({
  // displaying active menu items
  filter: computed.alias('stateManager.owner.phone.content.contactsFilter'),

  shouldShowAppMessage: computed(function() {
    return get(config, 'appMessage.oldestMessageInDays');
  }),

  actions: {
    closeAppUpdateMessage() {
      this.set('shouldShowAppMessage', false);
    },
    registerTourManagerAndStartTour(tourManager) {
      if (tourManager && tourManager.startTourImmediately) {
        run.scheduleOnce('afterRender', tourManager.actions.startTour);
      }
    },
  },
});
