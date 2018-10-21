import Ember from 'ember';
import DS from 'ember-data';
import MF from 'model-fragments';

const { computed } = Ember;

export default MF.Fragment.extend({
  type: DS.attr('string'),
  link: DS.attr('string'),
  source: computed.alias('link'),
  // only for images
  width: DS.attr('number', { defaultValue: null }),
  height: DS.attr('number', { defaultValue: null })
});
