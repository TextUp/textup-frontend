import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import MF from 'model-fragments';
import Shareable from 'textup-frontend/mixins/model/shareable';

const { computed } = Ember;

export default MF.Fragment.extend(Dirtiable, Shareable, {
  whenCreated: DS.attr('date'),
  phoneId: DS.attr('number'),
  [Constants.PROP_NAME.SHARING_IDENT]: computed.readOnly('phoneId'),
});
