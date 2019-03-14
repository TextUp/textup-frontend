import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import MF from 'model-fragments';

export default MF.Fragment.extend(Dirtiable, {
  numTexts: DS.attr('number'),
  numCalls: DS.attr('number'),
  numVoicemails: DS.attr('number'),
});
