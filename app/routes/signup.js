import $ from 'jquery';
import Route from '@ember/routing/route';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import IsPublic from 'textup-frontend/mixins/route/is-public';

export default Route.extend(IsPublic, {
  model() {
    this._super(...arguments);
    return $.ajax({
      type: Constants.REQUEST_METHOD.GET,
      url: `${config.host}/v1/public/organizations?status[]=approved`,
    }).then(({ organizations = [] }) => {
      return organizations.map(org => {
        return this.get('store').push(this.get('store').normalize('organization', org));
      });
    });
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set('staff', this.get('store').createRecord('staff'));
  },
  resetController(controller) {
    this._super(...arguments);
    const newStaff = controller.get('staff'),
      selected = controller.get('selected');
    if (newStaff) {
      controller.set('staff', null);
      newStaff.rollbackAttributes();
    }
    if (selected) {
      controller.set('selected', null);
      selected.get('location.content').rollbackAttributes();
      selected.rollbackAttributes();
    }
  },
});
