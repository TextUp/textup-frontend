import Ember from 'ember';

export default Ember.Route.extend({
  _newModel: null,

  afterModel(team) {
    // newly-created teams will lose their location reference, so we will re-fetch the team
    // if this has happened
    if (team && !team.get('location.content')) {
      const id = team.get('id');
      team.unloadRecord();
      return this.store.findRecord('team', id).then(found => this.set('_newModel', found));
    } else {
      this.set('_newModel', team);
    }
  },
  setupController: function(controller) {
    this._super(...arguments);
    controller.set('team', this.get('_newModel'));
  },
  deactivate: function() {
    const team = this.controller.get('team');
    if (team.get('hasDirtyAttributes')) {
      team.rollbackAttributes();
    }
  }
});
