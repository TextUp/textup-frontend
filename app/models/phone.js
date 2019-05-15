import ArrayUtils from 'textup-frontend/utils/array';
import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import MF from 'ember-data-model-fragments';
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
  { computed, getWithDefault, tryInvoke, isPresent, get } = Ember;

export default DS.Model.extend(Dirtiable, Validations, {
  // Overrides
  // ---------

  init() {
    this._super(...arguments);
    this.resetContactsFilter();
  },
  rollbackAttributes() {
    tryInvoke(getWithDefault(this, 'media.content', {}), 'rollbackAttributes');
    return this._super(...arguments);
  },
  hasManualChanges: computed('media.isDirty', function() {
    return !!this.get('media.isDirty');
  }),

  // Properties
  // ----------

  awayMessage: DS.attr('string', { defaultValue: '' }),
  awayMessageMaxLength: DS.attr('number', { defaultValue: 320 }),

  number: DS.attr('phone-number'),
  isActive: DS.attr('boolean'),
  voice: DS.attr('string'),
  language: DS.attr('string', { defaultValue: Constants.DEFAULT.LANGUAGE }),

  media: DS.belongsTo('media'), // hasOne
  requestVoicemailGreetingCall: DS.attr(),
  useVoicemailRecordingIfPresent: DS.attr('boolean'),
  allowSharingWithOtherTeams: DS.attr('boolean'),

  tags: DS.hasMany('tag'),
  policies: MF.fragmentArray('owner-policy'),

  totalNumContacts: null,
  contacts: computed.readOnly('_sortedContacts'),
  contactsFilter: null,
  contactStatuses: computed.readOnly('_contactStatuses'),

  // Private properties
  // ------------------

  _contactStatuses: computed('contactsFilter', function() {
    const filters = Constants.CONTACT.FILTER,
      statuses = Constants.CONTACT.STATUS,
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
    return this.get('_contacts').filter(contact => statuses.includes(get(contact, 'status')));
  }),
  _uniqueContacts: computed.uniqBy('_filteredContacts', 'id'),
  _contactSortOptions: ['intStatus:asc', 'lastRecordActivity:desc'],
  _sortedContacts: computed.sort('_uniqueContacts', '_contactSortOptions'),

  // Methods
  // -------

  resetContactsFilter() {
    this.set('contactsFilter', Constants.CONTACT.FILTER.ALL);
  },

  // No need to add to beginning because we will sort contacts anyways
  addContacts(contacts) {
    const list = this.get('_contacts'),
      toAdd = ArrayUtils.ensureArrayAndAllDefined(contacts);
    if (isPresent(toAdd)) {
      list.pushObjects(toAdd);
    }
  },

  clearContacts() {
    this.set('totalNumContacts', null);
    this.get('_contacts').clear();
  },
});
