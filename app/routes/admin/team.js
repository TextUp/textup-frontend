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
    this._resetController(controller, team);
  },

  actions: {
    didTransition() {
      this._super(...arguments);
      if (!this.get('stateManager.viewingTeam')) {
        this._resetController(this.controller, this.get('team'));
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

  _resetController(controller, team) {
    controller.set('people', []);
    controller.set('numPeople', team.get('numMembers'));
    const peopleList = controller.get('_peopleList');
    if (peopleList) {
      peopleList.actions.resetAll();
    }
  },
});
