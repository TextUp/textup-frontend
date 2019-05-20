import { readOnly } from '@ember/object/computed';
import Service, { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import Constants from 'textup-frontend/constants';

export default Service.extend({
  requestService: service(),
  store: service(),

  // Properties
  // ----------

  editingStaffId: readOnly('_editingStaffId'),

  // Methods
  // -------

  setEditingStaff(staffId) {
    this.set('_editingStaffId', staffId);
  },
  clearEditingStaff() {
    this.set('_editingStaffId', null);
  },
  loadPendingStaff(orgId, offset = 0) {
    return new RSVP.Promise((resolve, reject) => {
      this.get('requestService')
        .handleIfError(
          this.get('store').query('staff', {
            organizationId: orgId,
            status: [Constants.STAFF.STATUS.PENDING],
            offset,
          })
        )
        .then(success => {
          resolve({ pending: success.toArray(), numPending: success.get('meta.total') });
        }, reject);
    });
  },

  // Internal properties
  // -------------------

  _editingStaffId: null,
});
