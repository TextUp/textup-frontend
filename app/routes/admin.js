import { isArray } from '@ember/array';
import { copy } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';
import RSVP, { all } from 'rsvp';
import { run } from '@ember/runloop';
import AppAccessUtils from 'textup-frontend/utils/app-access';
import callIfPresent from 'textup-frontend/utils/call-if-present';
import Constants from 'textup-frontend/constants';
import HasSlideoutOutlet from 'textup-frontend/mixins/route/has-slideout-outlet';
import humanId from 'human-id';
import IsAuthenticated from 'textup-frontend/mixins/route/is-authenticated';
import RequiresSetup from 'textup-frontend/mixins/route/requires-setup';
import SupportsFeedbackSlideout from 'textup-frontend/mixins/route/supports-feedback-slideout';

export default Route.extend(
  HasSlideoutOutlet,
  IsAuthenticated,
  RequiresSetup,
  SupportsFeedbackSlideout,
  {
    adminService: service(),
    authService: service(),
    dataService: service(),
    requestService: service(),
    stateService: service(),

    slideoutOutlet: Constants.SLIDEOUT.OUTLET.DETAIL,

    beforeModel() {
      this._super(...arguments);
      const authUser = this.get('authService.authUser');
      if (!AppAccessUtils.canStaffAccessAdminDashboard(authUser)) {
        AppAccessUtils.determineAppropriateLocation(this, authUser);
      }
    },
    model() {
      this._super(...arguments);
      return this.get('authService.authUser.org');
    },
    afterModel(org) {
      this._super(...arguments);
      this.get('stateService').set('owner', org);
    },
    setupController(controller, org) {
      this._super(...arguments);
      this.get('adminService')
        .loadPendingStaff(org.get('id'))
        .then(({ pending, numPending }) => controller.setProperties({ pending, numPending }));
    },
    redirect(model, transition) {
      this._super(...arguments);
      if (transition.targetName === 'admin.index') {
        this.transitionTo('admin.people');
      }
    },

    actions: {
      toggleSelected(staff) {
        if (!this.get('stateService.viewingMany')) {
          if (this.get('stateService.viewingTeam')) {
            this.transitionTo('admin.team.many');
          } else {
            this.transitionTo('admin.people.many');
          }
        }
        staff.toggleProperty('isSelected');
      },

      // Staff
      // -----

      initializeNewStaff() {
        this.controller.set(
          'newStaff',
          this.store.createRecord('staff', {
            org: this.get('currentModel'),
            status: Constants.STAFF.STATUS.STAFF,
            password: humanId({ separator: '-', capitalize: false }),
          })
        );
      },
      cleanNewStaff(staff, then = undefined) {
        // set to false to prevent adding new phone toggle
        // from showing true when reinitializing this slideout
        // after it is closed with with phoneAction set to true
        staff.set('phoneAction', null);
        callIfPresent(this, then);
      },
      createStaff(staff, then = undefined) {
        return this.get('dataService')
          .persist(staff)
          .then(() => {
            const people = this.controller.get('people');
            if (people) {
              people.unshiftObject(staff);
              this.controller.set('people', copy(people));
            }
            callIfPresent(this, then);
          });
      },
      markStaff(data) {
        const people = isArray(data) ? data : [data];
        people.forEach(person => person.makeStaff());
        this._changeStaffStatus(people);
      },
      markAdmin(data) {
        const people = isArray(data) ? data : [data];
        people.forEach(person => person.makeAdmin());
        this._changeStaffStatus(people);
      },
      markBlocked(data) {
        const people = isArray(data) ? data : [data];
        people.forEach(person => person.block());
        this._changeStaffStatus(people);
      },

      // Team
      // ----

      initializeNewTeam() {
        const org = this.get('currentModel');
        this.controller.set(
          'newTeam',
          this.store.createRecord('team', {
            org: org,
            location: this.store.createRecord('location', {
              address: org.get('location.address'),
              lat: org.get('location.lat'),
              lng: org.get('location.lng'),
            }),
          })
        );
      },
      createTeam(team, then = undefined) {
        return this.get('dataService')
          .persist(team)
          .then(persistedTeam => {
            // there's a zombie location record that persists, but we
            // are leaving it in the store because unloading the zombie
            // location also disassociates the team and its location
            const model = this.get('currentModel');
            model.get('teams').then(teams => teams.unshiftObject(persistedTeam));
            callIfPresent(this, then);
          });
      },
      updateTeamMemberships(teams, person, then = undefined) {
        const people = isArray(person) ? person : [person];
        return new RSVP.Promise((resolve, reject) => {
          this.get('dataService')
            .persist(teams)
            .then(() => {
              // allows for some time for the backend to save the new membership state
              run.later(() => {
                this.get('requestService')
                  .handleIfError(all(people.map(person => person.reload())))
                  .then(() => {
                    callIfPresent(this, then);
                    resolve();
                  }, reject);
              }, 1000);
            });
        });
      },

      // Phone
      // -----

      persistWithPhone(withPhone, then) {
        const isTransfer = withPhone.get('phoneAction') === Constants.ACTION.PHONE.TRANSFER,
          data = withPhone.get('phoneActionData'),
          targetId = isTransfer ? get(data, 'id') : null,
          targetClass = isTransfer ? get(data, Constants.PROP_NAME.MODEL_NAME) : null;
        return this.get('dataService')
          .persist(withPhone)
          .then(() => {
            if (targetId && targetClass) {
              return this.store
                .findRecord(targetClass, targetId, { reload: true })
                .then(() => callIfPresent(this, then));
            } else {
              callIfPresent(this, then);
            }
          });
      },
    },

    // Helpers
    // -------

    _changeStaffStatus(people) {
      this.get('dataService')
        .persist(people)
        .then(updatedPeople => {
          this.controller.notifyPropertyChange('people');
          updatedPeople.forEach(per => per.set('isSelected', false));
        });
    },
  }
);
