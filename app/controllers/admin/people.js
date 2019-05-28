import Controller from '@ember/controller';
import PropertyUtils from 'textup-frontend/utils/property';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({
  staffListService: service(),

  queryParams: ['filter'],
  filter: alias('staffListService.filter'),
  peopleList: null,

  actions: {
    toggleSelected(staff) {
      if (staff) {
        this.transitionTo('admin.people.many');
        staff.toggleProperty('isSelected');
      }
    },
  },

  resetState() {
    this.get('staffListService').resetState();
    PropertyUtils.callIfPresent(this.get('peopleList.actions.resetAll'));
  },
});
