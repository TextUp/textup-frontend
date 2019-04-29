import config from 'textup-frontend/config/environment';
import Ember from 'ember';

const { computed, get } = Ember;

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
    registerTourManager(tourManager) {
      if (tourManager.startTourImmediately) {
        Ember.run.scheduleOnce('afterRender', () => {
          const mobileParent = Ember.$('#tour-testing123');
          if (mobileParent.is(':visible')) {
            const openBeforeTour = mobileParent.children('#tour-openSlideoutButton');
            openBeforeTour.click();
          }
          Ember.run.scheduleOnce('afterRender', tourManager.actions.startTour);
        });
      }
    }
  }
});
