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
  },
});
