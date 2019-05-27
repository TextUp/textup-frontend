import AdminPeopleRoute from 'textup-frontend/routes/admin/people';
import Constants from 'textup-frontend/constants';
import { inject as service } from '@ember/service';

export default AdminPeopleRoute.extend({
  serialize(model) {
    return { team_identifier: model.get(Constants.PROP_NAME.URL_IDENT) };
  },
  model({ team_identifier }) {
    const team = this.modelFor('admin')
      .get('teams')
      .findBy(Constants.PROP_NAME.URL_IDENT, team_identifier);
    if (team) {
      return team;
    } else {
      this.transitionTo('admin.people');
    }
  },
});
