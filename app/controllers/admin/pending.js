import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { computed } = Ember;

export default Ember.Controller.extend({
  adminService: Ember.inject.service(),
  numberService: Ember.inject.service(),
  adminController: Ember.inject.controller('admin'),

  pendingStaff: computed.alias('adminController.pending'),
  numPending: computed.alias('adminController.numPending'),

  actions: {
    approve(staff) {
      staff.set('status', 'STAFF');
      if (staff.get('hasPhoneActionData')) {
        staff.set('phoneAction', Constants.ACTION.PHONE.CHANGE_NUMBER);
      }
      this._handlePending(staff);
    },
    reject(staff) {
      staff.set('phoneAction', null);
      staff.set('status', 'BLOCKED');
      this._handlePending(staff);
    },
    loadMore() {
      return new Ember.RSVP.Promise((resolve, reject) => {
        const pendingStaff = this.get('pendingStaff');
        this.get('adminService')
          .loadPendingStaff(this.get('stateManager.ownerAsOrg.id'), pendingStaff.get('length'))
          .then(({ pending, numPending }) => {
            pendingStaff.pushObjects(pending);
            this.set('numPending', numPending);
            resolve();
          }, this.get('dataService').buildErrorHandler(reject));
      });
    },
  },

  _handlePending(staff) {
    this.get('dataService')
      .persist(staff)
      .then(() => {
        staff.set('pendingAction', null);
        const pending = this.get('pendingStaff').removeObject(staff);
        this.set('pendingStaff', Ember.copy(pending));
      });
  },
});
