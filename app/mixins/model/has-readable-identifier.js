import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import DS from 'ember-data';

const { computed } = Ember;

export default Ember.Mixin.create({
  name: DS.attr('string'),
  [Constants.PROP_NAME.READABLE_IDENT]: computed.readOnly('name'),
});
