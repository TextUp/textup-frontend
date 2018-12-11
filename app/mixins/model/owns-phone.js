import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

const { computed, getWithDefault, tryInvoke } = Ember,
  // Validations are ininheritable: https://github.com/offirgolan/ember-cp-validations/issues/111
  Validations = buildValidations({
    phone: {
      description: 'Phone',
      validators: [validator('belongs-to')]
    },
    phoneAction: {
      description: 'Change going to be made to this phone',
      validators: [
        validator('inclusion', {
          allowBlank: true,
          in: model => Object.values(model.get('constants.PHONE.ACTION'))
        })
      ]
    },
    transferFilter: {
      description: 'Data for the change going to be made to this phone',
      validators: [validator('presence', true)]
    }
  });

export default Ember.Mixin.create(Dirtiable, Validations, {
  constants: Ember.inject.service(),

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

  hasInactivePhone: DS.attr('boolean'),
  phone: DS.belongsTo('phone'), // hasOne

  hasPhoneAction: computed.notEmpty('phoneAction'),
  phoneAction: null,

  hasPhoneActionData: computed.notEmpty('phoneActionData'), // not all actions have data!
  phoneActionData: null,

  transferId: computed('constructor.modelName', 'id', function() {
    return `${this.get('constructor.modelName')}-${this.get('id')}`;
  }),
  // Models that own a phone must implement `transferFilter`
  transferFilter: null
});
