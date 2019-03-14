import Constants from 'textup-frontend/constants';
import Dirtiable from '../mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import HasUrlIdentifier from 'textup-frontend/mixins/model/has-url-identifier';
import OwnsFutureMessages from '../mixins/model/owns-future-messages';
import OwnsRecordItems from '../mixins/model/owns-record-items';
import { validator, buildValidations } from 'ember-cp-validations';

const { alias, notEmpty, equal: eq } = Ember.computed,
  Validations = buildValidations({
    name: { description: 'Name', validators: [validator('presence', true)] },
  });

export default DS.Model.extend(
  Dirtiable,
  Validations,
  HasUrlIdentifier,
  OwnsRecordItems,
  OwnsFutureMessages,
  {
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
      this._super(...arguments);
      this.rollbackAttributes();
    },
    didUpdate() {
      this._super(...arguments);
      this.rollbackAttributes();
    },

    // Attributes
    // ----------

    name: DS.attr('string'),
    hexColor: DS.attr('string', { defaultValue: Constants.COLOR.BRAND }),
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

    // Methods
    // -------

    clearMembershipChanges() {
      this.get('actions').clear();
    },
  }
);
