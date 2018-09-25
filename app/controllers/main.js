import config from 'textup-frontend/config/environment';
import Ember from 'ember';

const { computed, get } = Ember;

export default Ember.Controller.extend({
  // see main.contacts controller for explanation of _transitioning
  _transitioning: false,
  // alias the filter property of main for displaying active menu items
  filter: 'all',
  // store contacts on mainController so we can add new contacts for display
  contacts: computed.alias('stateManager.owner.phone.content.contacts'),

  appMessageEndpoint: computed(function() {
    return get(config, 'appMessage.messageEndpoint');
  }),
  shouldShowAppMessage: computed(function() {
    return get(config, 'appMessage.oldestMessageInDays');
  }),

  actions: {
    closeAppUpdateMessage() {
      this.set('shouldShowAppMessage', false);
    }
  }
});
