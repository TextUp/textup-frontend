import { alias } from '@ember/object/computed';
import { copy } from '@ember/object/internals';
import { Promise } from 'rsvp';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import Constants from 'textup-frontend/constants';

export default Controller.extend({
  adminService: service(),
  dataService: service(),
  numberService: service(),
  requestService: service(),
  stateService: service(),

  adminController: controller('admin'),

  pendingStaff: alias('adminController.pending'),
  numPending: alias('adminController.numPending'),

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
      return new Promise((resolve, reject) => {
        const pendingStaff = this.get('pendingStaff');
        this.get('requestService')
          .handleIfError(
            this.get('adminService').loadPendingStaff(
              this.get('stateService.ownerAsOrg.id'),
              pendingStaff.get('length')
            )
          )
          .then(({ pending, numPending }) => {
            pendingStaff.pushObjects(pending);
            this.set('numPending', numPending);
            resolve();
          }, reject);
      });
    },
  },

  _handlePending(staff) {
    this.get('dataService')
      .persist(staff)
      .then(() => {
        staff.set('pendingAction', null);
        const pending = this.get('pendingStaff').removeObject(staff);
        this.set('pendingStaff', copy(pending));
      });
  },
});
