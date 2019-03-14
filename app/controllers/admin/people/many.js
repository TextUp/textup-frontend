import Ember from 'ember';

const { filterBy } = Ember.computed;

export default Ember.Controller.extend({
  peopleController: Ember.inject.controller('admin.people'),

  selected: filterBy('peopleController.people', 'isSelected', true),
  selectedAdmins: filterBy('selected', 'isAdmin', true),

  selectedMe: Ember.computed('selected.[]', function() {
    const myUsername = this.get('authService.authUser.username');
    return this.get('selected').any(person => {
      return person.get('username') === myUsername;
    });
  }),

  actions: {
    selectAll() {
      this.get('peopleController.people').forEach(person => {
        person.set('isSelected', true);
      });
    },
    selectAllStaff() {
      this.get('peopleController.people').forEach(person => {
        if (person.get('isStaff')) {
          person.set('isSelected', true);
        } else {
          person.set('isSelected', false);
        }
      });
    },
    deselect(person) {
      person.set('isSelected', false);
      Ember.run.next(this, function() {
        if (this.get('selected.length') === 0) {
          this._exitMany();
        }
      });
    },
    leave() {
      this._deselectAll();
      this._exitMany();
    },
  },

  // Helpers
  // -------

  _deselectAll() {
    this.get('selected').forEach(person => person.set('isSelected', false));
  },
  _exitMany() {
    if (this.get('stateManager.viewingTeam')) {
      this.transitionToRoute('admin.team');
    } else {
      this.transitionToRoute('admin.people');
    }
  },
});
