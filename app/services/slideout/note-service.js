import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';
import TypeUtils from 'textup-frontend/utils/type';
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';

export default Service.extend({
  dataService: service(),
  recordItemService: service(),
  slideoutService: service(),

  // Properties
  // ----------

  recordNote: null,
  shouldDisablePrimaryAction: readOnly('recordNote.validations.isInvalid'),
  shouldForceKeepOpen: readOnly('recordNote.isSaving'),
  isReadOnly: computed('_recordOwner.allowEdits', function() {
    const owner = this.get('_recordOwner');
    return TypeUtils.isContact(owner) && !owner.get('allowEdits');
  }),

  // Methods
  // -------

  openNewNoteSlideout(recordOwner, addAfterRecordItem = null) {
    this.setProperties({
      _recordOwner: recordOwner,
      recordNote: this.get('recordItemService').createNewNote(recordOwner, addAfterRecordItem),
    });
    this.get('slideoutService').toggleSlideout(
      'slideouts/record-note/create',
      Constants.SLIDEOUT.OUTLET.DETAIL
    );
  },
  openExistingNoteSlideout(recordOwner, recordNote) {
    this.setProperties({ _recordOwner: recordOwner, recordNote });
    this.get('slideoutService').toggleSlideout(
      'slideouts/record-note/edit',
      Constants.SLIDEOUT.OUTLET.DETAIL
    );
  },

  cancelSlideout() {
    const recordNote = this.get('recordNote');
    if (recordNote) {
      recordNote.rollbackAttributes();
    }
    this.get('slideoutService').closeSlideout();
  },
  finishSlideout() {
    return this.get('dataService')
      .persist(this.get('recordNote'))
      .then(() => this.get('slideoutService').closeSlideout());
  },

  // Internal
  // --------

  _recordOwner: null,
});
