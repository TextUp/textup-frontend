import Service from '@ember/service';
import { get, computed } from '@ember/object';
import config from 'textup-frontend/config/environment';

export default Service.extend({
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
