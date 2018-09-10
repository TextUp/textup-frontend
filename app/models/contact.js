import Dirtiable from '../mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import OwnsFutureMessages from '../mixins/model/owns-future-messages';
import OwnsRecordItems from '../mixins/model/owns-record-items';
import { validate as validateNumber } from '../utils/phone-number';
import { validator, buildValidations } from 'ember-cp-validations';

const { isEmpty, isPresent, computed: { notEmpty, equal: eq } } = Ember,
  Validations = buildValidations({
    name: { description: 'Name', validators: [validator('presence', true)] },
    note: { description: 'Note', validators: [validator('length', { max: 1000 })] },
    status: validator('inclusion', { in: ['UNREAD', 'ACTIVE', 'ARCHIVED', 'BLOCKED'] }),
    numbers: {
      description: 'Numbers',
      validators: [
        validator('collection', {
          collection: true,
          dependentKeys: ['numbers.@each.number'],
          message: 'All phone numbers must be valid, with area code',
          for: 'every',
          test: function(numObj) {
            return validateNumber(Ember.get(numObj, 'number'));
          }
        }),
        validator('length', { min: 1, message: 'Contact must have at least {min} phone number.' })
      ]
    }
  });

export default DS.Model.extend(Dirtiable, Validations, OwnsRecordItems, OwnsFutureMessages, {
  constants: Ember.inject.service(),

  init: function() {
    this._super(...arguments);
    this.set('actions', []);
  },
  rollbackAttributes: function() {
    this._super(...arguments);
    this.clearSharingChanges();
    this.get('numberDuplicates').clear();
    this.set('isSelected', false);
  },

  // Attributes
  // ----------

  name: DS.attr('string', { defaultValue: '' }),
  note: DS.attr('string', { defaultValue: '' }),
  status: DS.attr('string', {
    defaultValue: model => model.get('constants.CONTACT.STATUS.ACTIVE')
  }),
  numbers: DS.attr('collection', { defaultValue: () => [] }),
  phone: DS.belongsTo('phone'),
  unreadInfo: DS.attr(),

  // Contact
  // -------

  tags: DS.hasMany('tag'),
  sharedWith: DS.hasMany('sharedContact'),

  // Shared contact
  // --------------

  permission: DS.attr('string'),
  startedSharing: DS.attr('date'),
  sharedBy: DS.attr('string'),
  sharedById: DS.attr('number'),

  // Not attributes
  // --------------

  isSelected: false,
  numberDuplicates: Ember.computed(() => []),
  actions: null,

  // Computed properties
  // -------------------

  hasManualChanges: notEmpty('actions'),
  identifier: Ember.computed('name', 'numbers', function() {
    const name = this.get('name'),
      firstNum = this.get('numbers').objectAt(0);
    return isPresent(name) ? name : firstNum ? Ember.get(firstNum, 'number') : 'No Name';
  }),
  uniqueIdentifier: Ember.computed('name', 'numbers', function() {
    const name = this.get('name'),
      numbers = this.get('numbers').mapBy('number');
    return `${name} ${numbers.join(', ')}`;
  }),

  hasTags: notEmpty('tags'),
  isShared: notEmpty('sharedBy'),
  isSharedDelegate: eq('permission', 'DELEGATE'),
  isSharedView: eq('permission', 'VIEW'),
  allowEdits: Ember.computed('isShared', 'isSharedDelegate', function() {
    const shared = this.get('isShared'),
      delegate = this.get('isSharedDelegate');
    return !shared || (shared && delegate);
  }),

  isArchived: eq('status', 'ARCHIVED'),
  isBlocked: eq('status', 'BLOCKED'),
  isActive: eq('status', 'ACTIVE'),
  isUnread: eq('status', 'UNREAD'),

  // Helper methods
  // --------------

  addDuplicatesForNumber: function(num, dups) {
    if (isEmpty(dups)) {
      return;
    }
    this.removeDuplicatesForNumber(num);
    this.get('numberDuplicates').pushObject({
      number: num,
      duplicates: dups
    });
  },
  removeDuplicatesForNumber: function(num) {
    const dupsList = this.get('numberDuplicates'),
      foundObj = dupsList.findBy('number', num);
    if (foundObj) {
      dupsList.removeObject(foundObj);
    }
  },
  clearSharingChanges() {
    this.get('actions').clear();
  },

  isAnyStatus: function(raw) {
    return (Ember.isArray(raw) ? raw : [raw])
      .map(stat => String(stat).toLowerCase())
      .contains(String(this.get('status')).toLowerCase());
  }
});
