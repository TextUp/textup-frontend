import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { computed, run } = Ember;

export default Ember.Controller.extend({
  adminController: Ember.inject.controller('admin'),

  queryParams: ['filter'],
  filter: computed.alias('adminController.filter'),

  people: computed.alias('adminController.people'),
  numPeople: null,
  team: null,

  // Computed properties
  // -------------------

  statuses: computed('filter', function() {
    return this._translateFilter(this.get('filter'));
  }),

  // Observers
  // ---------

  filterPeopleByStatus: Ember.on(
    'init',
    Ember.observer('people.[]', function() {
      const people = this.get('people');
      if (!people) {
        return;
      }
      const statuses = this.get('statuses'),
        hasStatus = people.filter(pers => pers.isAnyStatus(statuses));
      // set people to with new array to trigger rebuild of infinite scroll
      this.set('people', hasStatus);
    })
  ),

  actions: {
    refresh() {
      const people = this.get('people');
      return this._loadMore().then(results => {
        run(() => {
          people.clear();
          people.pushObjects(results.toArray());
        });
      });
    },
    loadMore() {
      const people = this.get('people');
      return this._loadMore(people.length).then(results => {
        people.pushObjects(results.toArray());
      });
    },
  },

  _loadMore(offset = 0) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const org = this.get('stateManager.ownerAsOrg'),
        team = this.get('team');
      this.get('dataService')
        .request(
          this.get('store').query('staff', {
            max: 20,
            offset,
            status: this.get('statuses'),
            teamId: team ? team.get('id') : null,
            organizationId: org ? org.get('id') : null,
          })
        )
        .then(results => {
          this.set('numPeople', results.get('meta.total'));
          resolve(results);
        }, reject);
    });
  },
  _translateFilter(filter) {
    const options = {
      [Constants.STAFF.FILTER.ACTIVE]: [Constants.STAFF.STATUS.STAFF, Constants.STAFF.STATUS.ADMIN],
      [Constants.STAFF.FILTER.ADMINS]: [Constants.STAFF.STATUS.ADMIN],
      [Constants.STAFF.FILTER.DEACTIVATED]: [Constants.STAFF.STATUS.BLOCKED],
    };
    return filter ? options[filter.toLowerCase()] : options[Constants.STAFF.FILTER.ACTIVE];
  },
});
