import Ember from 'ember';
import Constants from 'textup-frontend/constants';
import * as TypeUtils from 'textup-frontend/utils/type';

const { RSVP } = Ember;

export default Ember.Service.extend({
  dataService: Ember.inject.service(),
  store: Ember.inject.service(),

  loadStaffForSharing(phoneOwner) {
    return new RSVP.Promise((resolve, reject) => {
      const ownerId = phoneOwner.get('id');
      this.get('dataService')
        .request(
          this.get('store').query('staff', {
            max: 100,
            status: [Constants.STAFF.STATUS.ADMIN, Constants.STAFF.STATUS.STAFF],
            teamId: TypeUtils.isTeam(phoneOwner) ? ownerId : null,
            shareStaffId: TypeUtils.isStaff(phoneOwner) ? ownerId : null,
          })
        )
        .then(results => resolve(results.toArray()), reject);
    });
  },
});
