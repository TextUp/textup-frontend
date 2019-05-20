import { alias } from '@ember/object/computed';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import MF from 'ember-data-model-fragments';

export default MF.Fragment.extend(Dirtiable, {
  type: DS.attr('string'),
  link: DS.attr('string'),
  source: alias('link'),
  // only for images
  width: DS.attr('number', { defaultValue: null }),
  height: DS.attr('number', { defaultValue: null }),
});
