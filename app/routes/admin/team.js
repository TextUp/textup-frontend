import Constants from 'textup-frontend/constants';
import Ember from 'ember';

export default Ember.Route.extend({
  controllerName: 'admin/people',
  templateName: 'admin/people',

  serialize(model) {
    return {
      team_identifier: model.get(Constants.PROP_NAME.URL_IDENT),
    };
  },
  model(params) {
    const id = params.team_identifier,
      teams = this.modelFor('admin').get('teams'),
      team = teams.findBy(Constants.PROP_NAME.URL_IDENT, id);
    if (team) {
      return team;
    } else {
      this.transitionTo('admin.people');
    }
  },
  setupController(controller, team) {
    this._super(...arguments);
    this.set('team', team);
    controller.set('team', team);
    this._resetController(team);
  },

  actions: {
    didTransition() {
      this._super(...arguments);
      if (!this.get('stateManager.viewingTeam')) {
        this._resetController(this.get('team'));
      }
      this.get('team').rollbackAttributes();
      // return true to allow bubbling to close slideout handler
      return true;
    },
    changeFilter(filter) {
      this.transitionTo('admin.people', {
        queryParams: {
          filter: filter,
        },
      });
    },
  },

  _resetController(team) {
    this.controller.set('people', []);
    this.controller.set('numPeople', team.get('numMembers'));
  },
});
