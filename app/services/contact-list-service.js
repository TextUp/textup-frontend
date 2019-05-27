import Service, { inject as service } from '@ember/service';

export const FILTER_TO_STATUSES = Object.freeze({
  [Constants.CONTACT.FILTER.ALL]: [
    Constants.CONTACT.STATUS.UNREAD,
    Constants.CONTACT.STATUS.ACTIVE,
  ],
  [Constants.CONTACT.FILTER.UNREAD]: [Constants.CONTACT.STATUS.UNREAD],
  [Constants.CONTACT.FILTER.ARCHIVED]: [Constants.CONTACT.STATUS.ARCHIVED],
  [Constants.CONTACT.FILTER.BLOCKED]: [Constants.CONTACT.STATUS.BLOCKED],
});
export const DEFAULT_FILTER = Constants.CONTACT.FILTER.ALL;
export const MAX_NUM_RESULTS = 20;

export default Service.extend({
  requestService: service(),
  router: service(),
  stateService: service(),
  store: service(),

  // Properties
  // ----------

  tagId: null,
  filter: DEFAULT_FILTER,
  contacts: readOnly('_sortedUniqueContactsByStatus'),
  totalNumContacts: null,

  // Methods
  // -------

  showFilteredContacts(filter) {
    // this will also set the `filter` property on this very service
    this.get('router').transitionTo('main.contacts', { queryParams: { filter } });
  },
  tryAddNewToContacts(contact) {
    if (this.get('stateService.viewingContacts') && TypeUtils.isContact(contact)) {
      // No need to add to beginning because we will sort contacts anyways
      this.get('_contacts').pushObject(contact);
    }
  },

  resetState(tagId = null) {
    this.setProperties({
      tagId,
      filter: DEFAULT_FILTER,
      totalNumContacts: null,
    });
    this.get('_contacts').clear();
  },

  refresh() {
    this.get('_contacts').clear();
    return this.loadMore();
  },
  loadMore() {
    // teamId added by `contact` adapter
    return this.get('requestService')
      .handleIfError(this.get('store').query(Constants.MODEL_NAME.CONTACT, this._buildLoadParams()))
      .then(results => {
        this.get('_contacts').pushObjects(results.toArray());
        this.set('totalNumContacts', results.get('meta.total'));
      });
  },

  // Internal
  // --------

  _contacts: computed(() => []),
  _contactsByStatus: filter('_contacts.@each.status', function(contact) {
    return this.get('_statuses').includes(contact.get('status'));
  }),
  _uniqueContactsByStatus: uniqBy('_contactsByStatus', 'id'),
  _contactSortOptions: Object.freeze(['intStatus:asc', 'lastRecordActivity:desc']),
  _sortedUniqueContactsByStatus: sort('_uniqueContactsByStatus', '_contactSortOptions'),
  _statuses: computed('filter', function() {
    const filter = TextUtils.lowercase(this.get('filter'));
    return FILTER_TO_STATUSES[filter] || FILTER_TO_STATUSES[DEFAULT_FILTER];
  }),

  _buildLoadParams() {
    return {
      max: MAX_NUM_RESULTS,
      offset: this.get('contacts.length'), // ensure unique
      status: this.get('_statuses'),
      tagId: this.get('tagId'),
    }.filter(Boolean);
  },
});
