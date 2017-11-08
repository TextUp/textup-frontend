import Ember from 'ember';
import Public from '../mixins/public-route';
import config from '../config/environment';

export default Ember.Route.extend(Public, {
  model: function() {
    return Ember.$
      .ajax({
        type: 'GET',
        url: `${config.host}/v1/public/organizations?status[]=approved`
      })
      .then(({ organizations = [] }) => {
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
  }
});
