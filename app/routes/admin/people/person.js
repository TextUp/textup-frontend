import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    const id = params.id;
    if (id) {
      const found = this.store.peekRecord('staff', id);
      return found ? found : this.store.findRecord('staff', id);
    } else {
      this.transitionTo('admin.people');
    }
  },
  setupController: function(controller, model) {
    this._super(...arguments);
    controller.set('person', model);
    controller.set('team', null);
  },

  actions: {
    // use will transition so that current model is
    // still the model of the route we are about to leave
    willTransition: function() {
      this._super(...arguments);
      this.send('revert', this.get('currentModel'));
      return true;
    }
  }
});
