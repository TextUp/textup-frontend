import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';

export default Service.extend({
  slideoutService: service(),

  // Properties
  // ----------

  tag: null,
  shouldDisablePrimaryAction: readOnly('tag.valiations.isInvalid'),
  shouldForceKeepOpen: readOnly('tag.isSaving'),

  // Methods
  // -------

  openSlideout(tag) {
    this.set('tag', tag);
    this.get('slideoutService').toggleSlideout(
      'slideouts/tag/edit',
      Constants.SLIDEOUT.OUTLET.DEFAULT
    );
  },
  cancelSlideout() {
    this.tryRollbackText();
    this.get('slideoutService').closeSlideout();
  },
  finishSlideout() {
    return this.get('dataService')
      .persist(this.get('tag'))
      .then(() => this.get('slideoutService').closeSlideout());
  },

  onTagMarkForDelete() {
    const tag = this.get('tag');
    if (tag) {
      tag.deleteRecord();
    }
  },
  tryRollbackText() {
    const tag = this.get('tag');
    if (tag) {
      tag.rollbackAttributes();
    }
  },
});
