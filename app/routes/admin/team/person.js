import AdminPeoplePersonRoute from 'textup-frontend/routes/admin/people/person';
import Ember from 'ember';

export default AdminPeoplePersonRoute.extend({
  controllerName: 'admin/people/person',
  templateName: 'admin/people/person',

  setupController(controller, model) {
    this._super(...arguments);
    controller.set('team', this.controllerFor('admin.team').get('team'));
  },
});
