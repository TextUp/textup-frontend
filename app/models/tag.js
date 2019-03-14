import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import HasReadableIdentifier from 'textup-frontend/mixins/model/has-readable-identifier';
import HasUrlIdentifier from 'textup-frontend/mixins/model/has-url-identifier';
import OwnsFutureMessages from 'textup-frontend/mixins/model/owns-future-messages';
import OwnsRecordItems from 'textup-frontend/mixins/model/owns-record-items';
import { validator, buildValidations } from 'ember-cp-validations';

const { alias, notEmpty, equal: eq } = Ember.computed,
  Validations = buildValidations({
    name: { description: 'Name', validators: [validator('presence', true)] },
  });

export default DS.Model.extend(
  Dirtiable,
  HasReadableIdentifier,
  HasUrlIdentifier,
  OwnsFutureMessages,
  OwnsRecordItems,
  Validations,
  {
    // Overrides
    // ---------

    init() {
      this._super(...arguments);
      this.set('actions', []);
    },
    rollbackAttributes() {
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

    // Methods
    // -------

    clearMembershipChanges() {
      this.get('actions').clear();
    },
  }
);
