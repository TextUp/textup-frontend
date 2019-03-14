import Ember from 'ember';

export default Ember.Route.extend({
  controllerName: 'admin/people/person',
  templateName: 'admin/people/person',

  model(params) {
    const id = params.id;
    if (id) {
      const found = this.store.peekRecord('staff', id);
      return found ? found : this.store.findRecord('staff', id);
    } else {
      this.transitionTo('admin.people');
    }
  },
  setupController(controller, model) {
    this._super(...arguments);
    controller.set('person', model);
    controller.set('team', this.controllerFor('admin.team').get('team'));
  },

  actions: {
    // use will transition so that current model is
    // still the model of the route we are about to leave
    willTransition() {
      this._super(...arguments);
      this.send('revert', this.get('currentModel'));
      return true;
    },
  },
});
