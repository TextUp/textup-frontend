import AdminPeoplePersonRoute from 'textup-frontend/routes/admin/people/person';

export default AdminPeoplePersonRoute.extend({
  controllerName: 'admin/people/person',
  templateName: 'admin/people/person',

  setupController(controller) {
    this._super(...arguments);
    controller.set('team', this.controllerFor('admin.team').get('team'));
  },
});
