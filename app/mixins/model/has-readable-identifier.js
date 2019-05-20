import { readOnly } from '@ember/object/computed';
import Mixin from '@ember/object/mixin';
import Constants from 'textup-frontend/constants';
import DS from 'ember-data';

export default Mixin.create({
  name: DS.attr('string'),
  [Constants.PROP_NAME.READABLE_IDENT]: readOnly('name'),
});
