import ArrayUtils from 'textup-frontend/utils/array';
import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import HasReadableIdentifier from 'textup-frontend/mixins/model/has-readable-identifier';
import HasUrlIdentifier from 'textup-frontend/mixins/model/has-url-identifier';
import MF from 'model-fragments';
import OwnsFutureMessages from 'textup-frontend/mixins/model/owns-future-messages';
import OwnsRecordItems from 'textup-frontend/mixins/model/owns-record-items';
import Shareable from 'textup-frontend/mixins/model/shareable';
import { validate as validateNumber } from 'textup-frontend/utils/phone-number';
import { validator, buildValidations } from 'ember-cp-validations';

const { isEmpty, computed } = Ember,
  Validations = buildValidations({
    name: { description: 'Name', validators: [validator('presence', true)] },
    note: { description: 'Note', validators: [validator('length', { max: 1000 })] },
    status: validator('inclusion', { in: Object.values(Constants.CONTACT.STATUS) }),
    numbers: {
      description: 'Numbers',
      validators: [
        validator('collection', {
          collection: true,
          dependentKeys: ['numbers.@each.number'],
          message: 'All phone numbers must be valid, with area code',
          for: 'every',
          test(numObj) {
            return validateNumber(Ember.get(numObj, 'number'));
          },
        }),
        validator('length', { min: 1, message: 'Contact must have at least {min} phone number.' }),
      ],
    },
  });

export default DS.Model.extend(
  Dirtiable,
  HasReadableIdentifier,
  HasUrlIdentifier,
  OwnsFutureMessages,
  OwnsRecordItems,
  Shareable,
  Validations,
  {
    // Overrides
    // ---------

    rollbackAttributes() {
      this._super(...arguments);
      this.clearSharingChanges();
      this.get('numberDuplicates').clear();
      this.set('isSelected', false);
    },
    hasManualChanges: computed.notEmpty('actions'),

    // Properties
    // ----------

    whenCreated: DS.attr('date'),
    name: DS.attr('string', { defaultValue: '' }),
    note: DS.attr('string', { defaultValue: '' }),
    numbers: DS.attr('collection', { defaultValue: () => [] }),

    status: DS.attr('string', { defaultValue: Constants.CONTACT.STATUS.ACTIVE }),
    unreadInfo: MF.fragment('contact/unread-info'),
    isArchived: computed.equal('status', Constants.CONTACT.STATUS.ARCHIVED),
    isBlocked: computed.equal('status', Constants.CONTACT.STATUS.BLOCKED),
    isActive: computed.equal('status', Constants.CONTACT.STATUS.ACTIVE),
    isUnread: computed.equal('status', Constants.CONTACT.STATUS.UNREAD),
    intStatus: Ember.computed('status', function() {
      const statuses = Constants.CONTACT.STATUS;
      switch (this.get('status')) {
        case statuses.UNREAD:
          return 0;
        case statuses.ACTIVE:
          return 1;
        case statuses.ARCHIVED:
          return 2;
        case statuses.BLOCKED:
          return 4;
        default:
          return 3;
      }
    }),

    phone: DS.belongsTo('phone'),
    tags: DS.hasMany('tag'),
    hasTags: computed.notEmpty('tags'),

    // if is owned contact
    [Constants.PROP_NAME.SHARING_PHONE_ID_BUCKETS]: MF.fragmentArray('contact/share-info'),
    // if is shared contact + Shareable mixin
    sharedByName: DS.attr('string'),
    sharedByPhoneId: DS.attr('number'),

    isSelected: false,
    numberDuplicates: Ember.computed(() => []),
    actions: Ember.computed(() => []),

    // Methods
    // -------

    addDuplicatesForNumber(num, dups) {
      if (isEmpty(dups)) {
        return;
      }
      this.removeDuplicatesForNumber(num);
      this.get('numberDuplicates').pushObject({ number: num, duplicates: dups });
    },
    removeDuplicatesForNumber(num) {
      const dupsList = this.get('numberDuplicates'),
        foundObj = dupsList.findBy('number', num);
      if (foundObj) {
        dupsList.removeObject(foundObj);
      }
    },
    clearSharingChanges() {
      this.get('actions').clear();
    },

    isAnyStatus(raw) {
      return ArrayUtils.ensureArrayAndAllDefined(raw)
        .map(stat => String(stat).toLowerCase())
        .contains(String(this.get('status')).toLowerCase());
    },
  }
);
