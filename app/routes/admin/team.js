import Ember from 'ember';
import { URL_IDENT_PROP_NAME } from 'textup-frontend/mixins/model/has-url-identifier';

export default Ember.Route.extend({
  controllerName: 'admin/people',
  templateName: 'admin/people',

  serialize: function(model) {
    return {
      team_identifier: model.get(URL_IDENT_PROP_NAME),
    };
  },
  model: function(params) {
    const id = params.team_identifier,
      teams = this.modelFor('admin').get('teams'),
      team = teams.findBy(URL_IDENT_PROP_NAME, id);
    if (team) {
      return team;
    } else {
      this.transitionTo('admin.people');
    }
  },
  setupController: function(controller, team) {
    this._super(...arguments);
    this.set('team', team);
    controller.set('team', team);
    this._resetController(team);
  },

  actions: {
    didTransition: function() {
      this._super(...arguments);
      if (!this.get('stateManager.viewingTeam')) {
        this._resetController(this.get('team'));
      }
      this.get('team').rollbackAttributes();
      // return true to allow bubbling to close slideout handler
      return true;
    },
    changeFilter: function(filter) {
      this.transitionTo('admin.people', {
        queryParams: {
          filter: filter,
        },
      });
    },
  },

  _resetController: function(team) {
    this.controller.set('people', []);
    this.controller.set('numPeople', team.get('numMembers'));
  },
});
