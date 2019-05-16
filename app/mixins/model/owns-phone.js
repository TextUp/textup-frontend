import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import HasUrlIdentifier from 'textup-frontend/mixins/model/has-url-identifier';
import { validator } from 'ember-cp-validations';

const { computed, getWithDefault, tryInvoke } = Ember;
// Validations are ininheritable: https://github.com/offirgolan/ember-cp-validations/issues/111
// [NOTE] don't mix into this mixin because of a bug where all classes that mix in this class
// will have their own validations overridden with the last class that mixed in this mixin
export const OwnsPhoneValidations = {
  phone: { description: 'Phone', validators: [validator('belongs-to')] },
  phoneAction: {
    description: 'Change going to be made to this phone',
    validators: [
      validator('inclusion', { allowBlank: true, in: Object.values(Constants.ACTION.PHONE) }),
    ],
  },
  transferFilter: {
    description: 'Data for the change going to be made to this phone',
    validators: [validator('presence', true)],
  },
};

export default Ember.Mixin.create(Dirtiable, HasUrlIdentifier, {
  // Overrides
  // ---------

  rollbackAttributes() {
    this.set('phoneAction', null);
    this.set('phoneActionData', null);
    tryInvoke(getWithDefault(this, 'phone.content', {}), 'rollbackAttributes');
    return this._super(...arguments);
  },
  didUpdate() {
    this._super(...arguments);
    this.rollbackAttributes();
  },
  // computed properties are inheritable but we don't leverage this because the list of properties
  // to recompute for is NOT inherited: https://stackoverflow.com/a/35259430
  ownsPhoneHasManualChanges: computed('phone.isDirty', 'hasPhoneAction', function() {
    return (
      !!this._super(...arguments) || !!this.get('phone.isDirty') || !!this.get('hasPhoneAction')
    );
  }),
  hasManualChanges: computed.alias('ownsPhoneHasManualChanges'),

  // Properties
  // ----------

  phone: DS.belongsTo('phone'), // hasOne

  hasPhoneAction: computed.notEmpty('phoneAction'),
  phoneAction: null,

  hasPhoneActionData: computed.notEmpty('phoneActionData'), // not all actions have data!
  phoneActionData: null,

  // Models that own a phone must implement `transferFilter`
  transferFilter: null,
});
