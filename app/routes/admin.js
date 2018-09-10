import callIfPresent from 'textup-frontend/utils/call-if-present';
import Ember from 'ember';
import HasSlideoutOutlet from 'textup-frontend/mixins/route/has-slideout-outlet';
import IsAuthenticated from 'textup-frontend/mixins/route/is-authenticated';
import humanId from 'npm:human-id';
import RequiresSetup from 'textup-frontend/mixins/route/requires-setup';

const { get, computed } = Ember;

export default Ember.Route.extend(HasSlideoutOutlet, IsAuthenticated, RequiresSetup, {
  slideoutOutlet: computed.alias('constants.SLIDEOUT.OUTLET.DETAIL'),

  beforeModel: function() {
    this._super(...arguments);
    const user = this.get('authService.authUser');
    return user.get('org').then(org => {
      if (!org.get('isApproved')) {
        this.transitionTo('none');
      } else if (!user.get('isAdmin')) {
        this.transitionTo('main', user);
      }
    });
  },
  model: function() {
    return this.get('authService.authUser.org');
  },
  afterModel: function(org) {
    this.get('stateManager').set('owner', org);
  },
  setupController: function(controller, org) {
    this._super(...arguments);
    this._loadPending(org);
  },
  redirect: function(model, transition) {
    this._super(...arguments);
    if (transition.targetName === 'admin.index') {
      this.transitionTo('admin.people');
    }
  },

  actions: {
    toggleSelected: function(staff) {
      if (!this.get('stateManager.viewingMany')) {
        if (this.get('stateManager.viewingTeam')) {
          this.transitionTo('admin.team.many');
        } else {
          this.transitionTo('admin.people.many');
        }
      }
      staff.toggleProperty('isSelected');
    },

    // Staff
    // -----

    initializeNewStaff: function() {
      this.controller.set(
        'newStaff',
        this.store.createRecord('staff', {
          org: this.get('currentModel'),
          status: 'STAFF',
          password: humanId({ separator: '-', capitalize: false })
        })
      );
    },
    cleanNewStaff: function(staff, then = undefined) {
      // set to false to prevent adding new phone toggle
      // from showing true when reinitializing this slideout
      // after it is closed with with phoneAction set to true
      staff.set('phoneAction', null);
      callIfPresent(this, then);
    },
    createStaff: function(staff, then = undefined) {
      return this.get('dataService')
        .persist(staff)
        .then(() => {
          const people = this.controller.get('people');
          if (people) {
            people.unshiftObject(staff);
            this.controller.set('people', Ember.copy(people));
          }
          callIfPresent(this, then);
        });
    },
    resetPassword: function(username) {
      return this.get('authService')
        .resetPassword(username)
        .then(
          () => {
            this.notifications.success(`All good! The password reset
          has been sent to the email address associated with ${username}.`);
          },
          () => {
            this.notifications.error(`Hmm. We could not find that account.
          Please try again.`);
          }
        );
    },
    markStaff: function(data) {
      const people = Ember.isArray(data) ? data : [data];
      people.forEach(person => person.makeStaff());
      this._changeStaffStatus(people);
    },
    markAdmin: function(data) {
      const people = Ember.isArray(data) ? data : [data];
      people.forEach(person => person.makeAdmin());
      this._changeStaffStatus(people);
    },
    markBlocked: function(data) {
      const people = Ember.isArray(data) ? data : [data];
      people.forEach(person => person.block());
      this._changeStaffStatus(people);
    },

    // Team
    // ----

    initializeNewTeam: function() {
      const org = this.get('currentModel');
      this.controller.set(
        'newTeam',
        this.store.createRecord('team', {
          org: org,
          location: this.store.createRecord('location', {
            address: org.get('location.address'),
            lat: org.get('location.lat'),
            lon: org.get('location.lon')
          })
        })
      );
    },
    createTeam: function(team, then = undefined) {
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
    updateTeamMemberships: function(teams, person, then = undefined) {
      const people = Ember.isArray(person) ? person : [person];
      return this.get('dataService')
        .persist(teams)
        .then(() => {
          const promises = people.map(person => person.reload());
          Ember.RSVP.all(promises).then(() => {
            callIfPresent(this, then);
          }, this.get('dataService').buildErrorHandler());
        });
    },

    // Phone
    // -----

    persistWithPhone: function(withPhone, then) {
      const isTransfer = withPhone.get('phoneAction') === 'transfer',
        data = withPhone.get('phoneActionData'),
        targetId = isTransfer ? get(data, 'id') : null,
        // if transfer, one of 'staff' or 'team', see phone-serializer.js mixin for
        // how this type is transformed into what is accepted by the backend
        targetClass = isTransfer ? get(data, 'type') : null;
      return this.get('dataService')
        .persist(withPhone)
        .then(() => {
          if (targetId && targetClass) {
            return this.store
              .findRecord(targetClass, targetId, {
                reload: true
              })
              .then(() => callIfPresent(this, then));
          } else {
            callIfPresent(this, then);
          }
        });
    }
  },

  // Helpers
  // -------

  _changeStaffStatus: function(people) {
    this.get('dataService')
      .persist(people)
      .then(updatedPeople => {
        this.controller.notifyPropertyChange('people');
        updatedPeople.forEach(per => per.set('isSelected', false));
      });
  },
  _loadPending: function(org) {
    this.store
      .query('staff', {
        organizationId: org.get('id'),
        status: ['pending']
      })
      .then(success => {
        this.controller.set('pending', success.toArray());
        this.controller.set('numPending', success.get('meta.total'));
      }, this.get('dataService').buildErrorHandler());
  }
});
