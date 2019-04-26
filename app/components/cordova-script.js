import Ember from 'ember';
import config from 'textup-frontend/config/environment';

export default Ember.Component.extend({
  tagName: 'script',

  attributeBindings: ['source:src', 'type'],

  type: 'text/javascript',

  source: Ember.computed(function() {
    return config.hasCordova ? 'cordova.js' : '';
  }),
});
