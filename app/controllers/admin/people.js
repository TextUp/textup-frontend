import Constants from 'textup-frontend/constants';
import Controller, { inject as controller } from '@ember/controller';
import RSVP from 'rsvp';
import { alias } from '@ember/object/computed';
import { computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import { run } from '@ember/runloop';

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
    PropertyUtils.tryInvoke(this.get('peopleList'), 'actions.resetAll');
  },
});
