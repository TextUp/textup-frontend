import Dirtiable from '../mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import OwnsFutureMessages from '../mixins/model/owns-future-messages';
import OwnsRecordItems from '../mixins/model/owns-record-items';
import { validator, buildValidations } from 'ember-cp-validations';

const { alias, notEmpty, equal: eq } = Ember.computed,
  Validations = buildValidations({
    name: { description: 'Name', validators: [validator('presence', true)] }
  });

export default DS.Model.extend(Dirtiable, Validations, OwnsRecordItems, OwnsFutureMessages, {
  constants: Ember.inject.service(),

  // Overrides
  // ------

  init: function() {
    this._super(...arguments);
    this.set('actions', []);
  },
  rollbackAttributes: function() {
    this._super(...arguments);
    this.clearMembershipChanges();
  },
  didCreate() {
    this.rollbackAttributes();
  },
  didUpdate() {
    this.rollbackAttributes();
  },

  // Attributes
  // ----------

  name: DS.attr('string'),
  hexColor: DS.attr('string', { defaultValue: model => model.get('constants.COLOR.BRAND') }),
  phone: DS.belongsTo('phone'),
  numMembers: DS.attr('number'),

  // Not attributes
  // --------------

  actions: null,

  // Computed properties
  // -------------------

  isEmpty: eq('numMembers', 0),
  hasManualChanges: notEmpty('actions'),
  identifier: alias('name'),
  uniqueIdentifier: alias('name'),
  urlIdentifier: Ember.computed('name', function() {
    return Ember.String.dasherize(this.get('name') || '');
  }),

  // Methods
  // -------

  clearMembershipChanges() {
    this.get('actions').clear();
  }
});
