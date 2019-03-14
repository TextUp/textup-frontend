import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { computed } = Ember;

export default Ember.Controller.extend({
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
        const query = Object.create(null),
          pending = this.get('pendingStaff');
        query.organizationId = this.get('stateManager.ownerAsOrg.id');
        query.status = ['pending'];
        if (pending.length) {
          query.offset = pending.length;
        }
        this.store.query('staff', query).then(success => {
          pending.pushObjects(success.toArray());
          this.set('numPending', success.get('meta.total'));
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
