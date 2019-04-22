import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import HasReadableIdentifier from 'textup-frontend/mixins/model/has-readable-identifier';
import HasUrlIdentifier from 'textup-frontend/mixins/model/has-url-identifier';
import OwnsFutureMessages from 'textup-frontend/mixins/model/owns-future-messages';
import OwnsRecordItems from 'textup-frontend/mixins/model/owns-record-items';
import { validator, buildValidations } from 'ember-cp-validations';

const { computed, typeOf } = Ember,
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
    hasManualChanges: computed.notEmpty('actions'),

    // Properties
    // ----------

    name: DS.attr('string'),
    [Constants.PROP_NAME.FILTER_VAL]: computed.alias('name'),

    hexColor: DS.attr('string', { defaultValue: Constants.COLOR.BRAND }),
    phone: DS.belongsTo('phone'),

    numMembers: DS.attr('number'),
    isEmpty: computed('numMembers', function() {
      const numMembers = this.get('numMembers');
      return typeOf(numMembers) !== 'number' || numMembers <= 0;
    }),

    actions: computed(() => []),

    // Methods
    // -------

    clearMembershipChanges() {
      this.get('actions').clear();
    },
  }
);
