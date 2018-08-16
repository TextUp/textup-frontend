import Dirtiable from '../mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const { computed } = Ember,
  Validations = buildValidations({
    name: {
      description: 'Name',
      validators: [validator('presence', true)]
    },
    hexColor: {
      description: 'Color',
      validators: [validator('presence', true)]
    },
    phone: {
      description: 'Phone',
      validators: [validator('belongs-to')]
    },
    location: {
      description: 'Location',
      validators: [validator('presence', true), validator('belongs-to')]
    }
  });

export default DS.Model.extend(Dirtiable, Validations, {
  init: function() {
    this._super(...arguments);
    this.set('actions', []);
  },
  rollbackAttributes: function() {
    this._super(...arguments);
    this.get('actions').clear();
    this.set('phoneAction', null);
    this.set('phoneActionData', null);
    this.get('phone').then(phone => phone && phone.rollbackAttributes());
    this.get('location').then(loc => loc && loc.rollbackAttributes());
  },

  // Events
  // ------

  didUpdate() {
    // reset manually-managed state after receiving the latest updates from the server
    this.rollbackAttributes();
  },

  // Attributes
  // ----------

  name: DS.attr('string'),
  hexColor: DS.attr('string', {
    defaultValue: '#3399cc'
  }),
  numMembers: DS.attr('number'),

  org: DS.belongsTo('organization'),
  hasInactivePhone: DS.attr('boolean'),
  phone: DS.belongsTo('phone'),
  location: DS.belongsTo('location'),

  // Not attributes
  // --------------

  type: 'team',
  actions: null,
  phoneAction: null, // one of number, transfer, deactivate
  phoneActionData: null,

  // Computed properties
  // -------------------

  hasPhoneAction: computed.notEmpty('phoneAction'),
  hasPhoneActionData: computed.notEmpty('phoneActionData'), // not all actions have data!
  hasActions: computed.notEmpty('actions'),
  hasManualChanges: computed.or(
    'hasActions',
    'phone.isDirty',
    'hasPhoneAction',
    'location.isDirty'
  ),

  urlIdentifier: computed('name', function() {
    return Ember.String.dasherize(this.get('name') || '');
  }),
  transferId: computed('id', function() {
    return `team-${this.get('id')}`;
  }),
  transferFilter: computed('name', 'location.content.address', function() {
    const name = this.get('name'),
      address = this.get('location.content.address');
    return `${name},${address}`;
  })
});
