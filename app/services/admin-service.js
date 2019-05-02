import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { computed, RSVP } = Ember;

export default Ember.Service.extend({
  requestService: Ember.inject.service(),
  store: Ember.inject.service(),

  // Properties
  // ----------

  editingStaffId: computed.readOnly('_editingStaffId'),

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
