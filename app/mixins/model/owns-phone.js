import { alias, notEmpty } from '@ember/object/computed';
import Mixin from '@ember/object/mixin';
import { getWithDefault, computed } from '@ember/object';
import { tryInvoke } from '@ember/utils';
import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import HasUrlIdentifier from 'textup-frontend/mixins/model/has-url-identifier';
import { validator } from 'ember-cp-validations';

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

export default Mixin.create(Dirtiable, HasUrlIdentifier, {
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
  hasManualChanges: alias('ownsPhoneHasManualChanges'),

  // Properties
  // ----------

  phone: DS.belongsTo('phone'), // hasOne

  hasPhoneAction: notEmpty('phoneAction'),
  phoneAction: null,

  hasPhoneActionData: notEmpty('phoneActionData'), // not all actions have data!
  phoneActionData: null,

  // Models that own a phone must implement `transferFilter`
  transferFilter: null,
});
