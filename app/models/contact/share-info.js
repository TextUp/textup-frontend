import { readOnly } from '@ember/object/computed';
import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import MF from 'ember-data-model-fragments';
import Shareable from 'textup-frontend/mixins/model/shareable';

export default MF.Fragment.extend(Dirtiable, Shareable, {
  whenCreated: DS.attr('date'),
  phoneId: DS.attr('number'),
  [Constants.PROP_NAME.SHARING_IDENT]: readOnly('phoneId'),
});
