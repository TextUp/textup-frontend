import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
  slideoutService: service(),

  // Properties
  // ----------

  recordNote: null,

  // Methods
  // -------

  openSlideout(recordNote) {
    this.set('recordNote', recordNote);
    this.get('slideoutService').toggleSlideout(
      'slideouts/record-note/revisions',
      Constants.SLIDEOUT.OUTLET.DETAIL
    );
  },
});
