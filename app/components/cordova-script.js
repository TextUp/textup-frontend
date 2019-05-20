import { computed } from '@ember/object';
import Component from '@ember/component';
import config from 'textup-frontend/config/environment';

export default Component.extend({
  tagName: 'script',

  attributeBindings: ['source:src', 'type'],

  type: 'text/javascript',

  source: computed(function() {
    return config.hasCordova ? 'cordova.js' : '';
  }),
});
