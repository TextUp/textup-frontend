import AppUtils from 'textup-frontend/utils/app';
import ArrayUtils from 'textup-frontend/utils/array';
import Constants from 'textup-frontend/constants';
import RSVP from 'rsvp';
import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { later } from '@ember/runloop';
import { readOnly } from '@ember/object/computed';

export default Service.extend({
  dataService: service(),
  requestService: service(),
  slideoutService: service(),
  stateService: service(),

  // Properties
  // ----------

  anyTeamChanges: false,
  staffs: null,
  teams: readOnly('stateService.ownerAsOrg.teams'),
  slideoutTitle: computed('staffs.[]', function() {
    if (this.get('staffs')) {
      const numStaffs = this.get('staffs.length'),
        name = this.get('staffs.firstObject.name');
      return numStaffs ? `Teams (${numStaffs} selected)` : `${name} Teams`;
    }
  }),

  // Methods
  // -------

  openSlideout(staffs) {
    this.setProperties({
      staffs: ArrayUtils.ensureArrayAndAllDefined(staffs),
      anyTeamChanges: false,
    });
    this.get('slideoutService').toggleSlideout(
      'slideouts/team/membership',
      Constants.SLIDEOUT.OUTLET.DETAIL
    );
  },
  cancelSlideout() {
    ArrayUtils.ensureArrayAndAllDefined(this.get('teams')).forEach(AppUtils.tryRollback);
    this.get('slideoutService').closeSlideout();
  },
  finishSlideout() {
    return new RSVP.Promise((resolve, reject) => {
      this.get('dataService')
        .persist(this.get('teams'))
        .then(() => {
          // allows for some time for the backend to save the new membership state
          // [FUTURE] allow batch-fetching staff
          later(() => {
            this.get('requestService')
              .handleIfError(RSVP.all(this.get('staffs').map(staff => staff.reload())))
              .then(() => {
                this.get('slideoutService').closeSlideout();
                resolve();
              }, reject);
          }, 1000);
        });
    });
  },
});
