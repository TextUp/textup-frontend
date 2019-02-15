import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import OwnsPhone, { OwnsPhoneValidations } from 'textup-frontend/mixins/model/owns-phone';
import { validator, buildValidations } from 'ember-cp-validations';

const { computed, tryInvoke, getWithDefault, assign } = Ember,
  Validations = buildValidations(
    assign(OwnsPhoneValidations, {
      name: { description: 'Name', validators: [validator('presence', true)] },
      hexColor: { description: 'Color', validators: [validator('presence', true)] },
      phone: { description: 'Phone', validators: [validator('belongs-to')] },
      location: {
        description: 'Location',
        validators: [validator('presence', true), validator('belongs-to')],
      },
    })
  );

export default DS.Model.extend(Dirtiable, Validations, OwnsPhone, {
  constants: Ember.inject.service(),

  // Overrides
  // ---------

  rollbackAttributes() {
    this.get('actions').clear();
    tryInvoke(getWithDefault(this, 'location.content', {}), 'rollbackAttributes');
    return this._super(...arguments);
  },
  didUpdate() {
    this._super(...arguments);
    this.rollbackAttributes();
  },
  hasManualChanges: computed(
    'ownsPhoneHasManualChanges',
    'hasActions',
    'location.isDirty',
    function() {
      return (
        this.get('ownsPhoneHasManualChanges') ||
        this.get('hasActions') ||
        !!this.get('location.isDirty')
      );
    }
  ),

  // Properties
  // ----------

  name: DS.attr('string'),
  hexColor: DS.attr('string', { defaultValue: model => model.get('constants.COLOR.BRAND') }),
  numMembers: DS.attr('number'),
  org: DS.belongsTo('organization'),
  location: DS.belongsTo('location'),
  type: computed.readOnly('constants.MODEL.TEAM'),

  actions: computed(() => []),
  hasActions: computed.notEmpty('actions'),

  urlIdentifier: computed('name', function() {
    return Ember.String.dasherize(this.get('name') || '');
  }),
  transferFilter: computed('name', 'location.content.address', function() {
    const name = this.get('name'),
      address = this.get('location.content.address');
    return `${name},${address}`;
  }),
});
