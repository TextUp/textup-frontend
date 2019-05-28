import AdminPeoplePersonRoute from 'textup-frontend/routes/admin/people/person';
import Constants from 'textup-frontend/constants';

export default AdminPeoplePersonRoute.extend({
  controllerName: 'admin/people/person',
  templateName: 'admin/people/person',

  // @Override
  backRouteParams: null,

  activate() {
    this._super(...arguments);
    this.set('backRouteParams', [
      'admin.team',
      this.modelFor('admin.team').get(Constants.PROP_NAME.URL_IDENT),
    ]);
  },
});
