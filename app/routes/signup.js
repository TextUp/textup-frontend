import $ from 'jquery';
import AppUtils from 'textup-frontend/utils/app';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import IsPublic from 'textup-frontend/mixins/route/is-public';
import Route from '@ember/routing/route';

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
    AppUtils.tryRollback(controller.get('staff'));
    AppUtils.tryRollback(controller.get('selected'));
    controller.setProperties({ staff: null, selected: null });
  },
});
