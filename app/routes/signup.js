import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import IsPublic from 'textup-frontend/mixins/route/is-public';

export default Ember.Route.extend(IsPublic, {
  model() {
    return Ember.$.ajax({
      type: Constants.REQUEST_METHOD.GET,
      url: `${config.host}/v1/public/organizations?status[]=approved`,
    }).then(({ organizations = [] }) => {
      return organizations.map(org => {
        return this.store.push(this.store.normalize('organization', org));
      });
    });
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set('staff', this.store.createRecord('staff'));
  },
  deactivate() {
    const controller = this.controller,
      newStaff = controller.get('staff'),
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
