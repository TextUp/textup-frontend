import Dirtiable from '../mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import uniqBy from 'textup-frontend/utils/uniq-by';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
    awayMessage: {
      description: 'Away Message',
      validators: [
        validator('length', {
          allowBlank: false,
          min: 1,
          max: model => model.get('awayMessageMaxLength'),
        }),
      ],
    },
  }),
  { computed, getWithDefault, tryInvoke, isArray, isPresent, get } = Ember;

export default DS.Model.extend(Dirtiable, Validations, {
  constants: Ember.inject.service(),

  // Overrides
  // ---------

  init() {
    this._super(...arguments);
    this.resetContactsFilter();
  },
  rollbackAttributes() {
    tryInvoke(getWithDefault(this, 'media.content', {}), 'rollbackAttributes');
    tryInvoke(getWithDefault(this, 'availability.content', {}), 'rollbackAttributes');
    return this._super(...arguments);
  },
  hasManualChanges: computed('availability.isDirty', 'media.isDirty', function() {
    return !!this.get('availability.isDirty') || !!this.get('media.isDirty');
  }),

  // Properties
  // ----------

  number: DS.attr('phone-number'),
  tags: DS.hasMany('tag'),

  totalNumContacts: '--',
  contacts: computed.readOnly('_sortedContacts'),
  contactsFilter: null,
  contactStatuses: computed.readOnly('_contactStatuses'),

  voice: DS.attr('string'),
  language: DS.attr('string', { defaultValue: model => model.get('constants.DEFAULT.LANGUAGE') }),

  media: DS.belongsTo('media'), // hasOne
  requestVoicemailGreetingCall: DS.attr(),
  useVoicemailRecordingIfPresent: DS.attr('boolean'),

  availability: DS.belongsTo('availability'),
  others: DS.hasMany('availability'),

  awayMessage: DS.attr('string', { defaultValue: '' }),
  awayMessageMaxLength: DS.attr('number', { defaultValue: 320 }),

  // Private properties
  // ------------------

  _contactStatuses: computed('contactsFilter', function() {
    const filters = this.get('constants.CONTACT.FILTER'),
      statuses = this.get('constants.CONTACT.STATUS'),
      thisFilter = this.get('contactsFilter') || '';
    switch (thisFilter) {
      case filters.UNREAD:
        return [statuses.UNREAD];
      case filters.ARCHIVED:
        return [statuses.ARCHIVED];
      case filters.BLOCKED:
        return [statuses.BLOCKED];
      default:
        return [statuses.UNREAD, statuses.ACTIVE];
    }
  }),
  _contacts: computed(() => []),
  _filteredContacts: computed('_contactStatuses', '_contacts.@each.status', function() {
    const statuses = this.get('_contactStatuses');
    return this.get('_contacts').filter(contact => statuses.contains(get(contact, 'status')));
  }),
  _uniqueContacts: uniqBy('_filteredContacts', 'id'),
  _contactSortOptions: ['intStatus:asc', 'lastRecordActivity:desc'],
  _sortedContacts: computed.sort('_uniqueContacts', '_contactSortOptions'),

  // Methods
  // -------

  resetContactsFilter() {
    this.set('contactsFilter', this.get('constants.CONTACT.FILTER.ALL'));
  },

  addContacts(contacts) {
    const list = this.get('_contacts');
    if (isPresent(contacts)) {
      list.pushObjects(isArray(contacts) ? contacts : [contacts]);
    }
  },

  clearContacts() {
    this.set('totalNumContacts', '--');
    this.get('_contacts').clear();
  },
});
