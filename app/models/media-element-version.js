import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import MF from 'model-fragments';

const { computed } = Ember;

export default MF.Fragment.extend(Dirtiable, {
  type: DS.attr('string'),
  link: DS.attr('string'),
  source: computed.alias('link'),
  // only for images
  width: DS.attr('number', { defaultValue: null }),
  height: DS.attr('number', { defaultValue: null })
});
