import AdminPeopleController from 'textup-frontend/controllers/admin/people';
import { assign } from '@ember/polyfills';

export default AdminPeopleController.extend({
  staffListService: service(),

  actions: {
    // @Override
    toggleSelected(staff) {
      if (staff) {
        this.transitionTo('admin.team.many');
        staff.toggleProperty('isSelected');
      }
    },
  },

  // Internal
  // --------

  // @Override
  resetState() {
    this._super(...arguments);
    this.get('staffListService').resetState(this.get('model.id'));
  },
});
