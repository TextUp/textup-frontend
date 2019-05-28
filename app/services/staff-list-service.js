import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';
import TextUtils from 'textup-frontend/utils/text';
import TypeUtils from 'textup-frontend/utils/type';
import { computed } from '@ember/object';
import { readOnly, filter, uniqBy } from '@ember/object/computed';

export const FILTER_TO_STATUSES = Object.freeze({
  [Constants.STAFF.FILTER.ACTIVE]: [Constants.STAFF.STATUS.STAFF, Constants.STAFF.STATUS.ADMIN],
  [Constants.STAFF.FILTER.ADMINS]: [Constants.STAFF.STATUS.ADMIN],
  [Constants.STAFF.FILTER.DEACTIVATED]: [Constants.STAFF.STATUS.BLOCKED],
});
export const DEFAULT_FILTER = Constants.STAFF.FILTER.ACTIVE;
export const MAX_NUM_RESULTS = 20;

export default Service.extend({
  requestService: service(),
  router: service(),
  stateService: service(),

  // Properties
  // ----------

  teamId: null,
  filter: DEFAULT_FILTER,
  people: readOnly('_uniquePeopleByStatus'),
  totalNumPeople: null,

  // Methods
  // -------

  showFilteredStaffs(filter) {
    // this will also set the `filter` property on this very service
    this.get('router').transitionTo('admin.people', { queryParams: { filter } });
  },
  tryAddNewToStaffs(staff) {
    if (!this.get('stateService.viewingTeam') && TypeUtils.isStaff(staff)) {
      // no sorting so need to add to beginning so is easily visible to user
      this.get('_people').unshiftObject(staff);
    }
  },

  resetState(teamId = null) {
    this.setProperties({
      teamId,
      filter: DEFAULT_FILTER,
      totalNumPeople: null,
    });
    this.get('_people').clear();
  },

  refresh() {
    this.get('_people').clear();
    return this.loadMore();
  },
  loadMore() {
    return this.get('requestService')
      .handleIfError(this.get('store').query(Constants.MODEL.STAFF, this._buildLoadParams()))
      .then(results => {
        this.get('_people').pushObjects(results.toArray());
        this.set('totalNumPeople', results.get('meta.total'));
      });
  },

  // Internal
  // --------

  _people: computed(() => []),
  _peopleByStatus: filter('_people.@each.status', function(person) {
    return this.get('_statuses').includes(person.get('status'));
  }),
  _uniquePeopleByStatus: uniqBy('_peopleByStatus', 'id'),
  _statuses: computed('filter', function() {
    const filter = TextUtils.lowercase(this.get('filter'));
    return FILTER_TO_STATUSES[filter] || FILTER_TO_STATUSES[DEFAULT_FILTER];
  }),

  _buildLoadParams() {
    return {
      max: MAX_NUM_RESULTS,
      offset: this.get('people.length'), // ensure unique
      organizationId: this.get('stateService.ownerAsOrg.id'),
      status: this.get('_statuses'),
      teamId: this.get('teamId'),
    }.filter(Boolean);
  },
});
