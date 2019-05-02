import config from 'textup-frontend/config/environment';
import Ember from 'ember';

const { computed, get } = Ember;

export default Ember.Service.extend({
  // Properties
  // ----------

  shouldShow: computed(function() {
    return get(config, 'appMessage.oldestMessageInDays');
  }),

  // Methods
  // -------

  closeMessage() {
    this.set('shouldShow', false);
  },
});
