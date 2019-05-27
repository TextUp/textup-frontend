import ArrayUtils from 'textup-frontend/utils/array';
import Constants from 'textup-frontend/constants';
import moment from 'moment';
import RSVP from 'rsvp';
import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isArray } from '@ember/array';
import { isNone } from '@ember/utils';
import { readOnly } from '@ember/object/computed';

export default Service.extend({
  composeSlideoutService: service(),
  recordItemService: service(),
  slideoutService: service(),
  stateService: service(),
  tutorialService: service(),

  // Properties
  // ----------

  tagRecordOwners: readOnly('stateService.owner.phone.content.tags'),
  recordOwners: null,
  recordOwnerName: readOnly(`recordOwners.firstObject.${Constants.PROP_NAME.READABLE_IDENT}`),

  startDate: null,
  endDate: null,
  isForEntirePhone: null,
  isGroupedExport: null,
  shouldDisablePrimaryAction: computed('startDate', 'endDate', function() {
    return isNone(this.get('startDate')) || isNone(this.get('endDate'));
  }),

  // Methods
  // -------

  openSingleExportSlideout(recordOwner) {
    this._resetProps(recordOwner);
    this.get('slideoutService').toggleSlideout(
      'slideouts/export/single',
      Constants.SLIDEOUT.OUTLET.DETAIL
    );
  },
  openMultipleExportSlideout(recordOwners = null) {
    this._resetProps(isArray(recordOwners) ? recordOwners : null); // may also be an event obj
    this.get('slideoutService').toggleSlideout(
      'slideouts/export/multiple',
      Constants.SLIDEOUT.OUTLET.DEFAULT
    );
  },
  cancelSlideout() {
    this.get('slideoutService').closeSlideout();
  },
  finishSlideout() {
    return new RSVP.Promise((resolve, reject) => {
      this.get('recordItemService')
        .exportRecordItems(
          this.get('startDate'),
          this.get('endDate'),
          this.get('isGroupedExport'),
          this.get('isForEntirePhone')
            ? [] // pass no record owners if we want to export entire phone
            : this.get('recordOwners')
        )
        .then(() => {
          this.send('closeSlideout');
          this.get('tutorialService').startCompleteTask(Constants.TASK.EXPORT);
          resolve();
        }, reject);
    });
  },

  insertRecordOwner(index, recordOwner) {
    return new RSVP.Promise(resolve => {
      this.get('recordOwners').replace(index, 1, [recordOwner]);
      resolve();
    });
  },
  removeRecordOwner(recordOwner) {
    this.get('recordOwners').removeObject(recordOwner);
  },

  // Internal
  // --------

  _resetProps(recordOwners = null) {
    const now = moment();
    this.setProperties({
      recordOwners: ArrayUtils.ensureArrayAndAllDefined(recordOwners),
      startDate: now.subtract(7, 'days').toDate(),
      endDate: now.toDate(),
      isForEntirePhone: false,
      isGroupedExport: false,
    });
  },
});
