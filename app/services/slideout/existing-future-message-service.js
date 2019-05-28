import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import PropertyUtils from 'textup-frontend/utils/property';
import Service, { inject as service } from '@ember/service';
import TypeUtils from 'textup-frontend/utils/type';
import { computed } from '@ember/object';

export default Service.extend({
  dataService: service(),
  slideoutService: service(),

  // Properties
  // ----------

  futureMessageOwner: null,
  shouldAllowEdits: computed('futureMessageOwner.allowEdits', function() {
    const owner = this.get('futureMessageOwner');
    return TypeUtils.isTag(owner) || (owner && owner.get('allowEdits'));
  }),

  // Methods
  // -------

  openSlideout(futureMessageOwner) {
    this.set('futureMessageOwner', futureMessageOwner);
    this.get('slideoutService').toggleSlideout(
      'slideouts/future-message/list',
      Constants.SLIDEOUT.OUTLET.DETAIL
    );
  },
  cancelEditing(fMessage, doClose) {
    AppUtils.tryRollback(fMessage);
    PropertyUtils.callIfPresent(doClose);
  },
  saveAfterEditing(fMessage, doClose) {
    return this.get('dataService')
      .persist(fMessage)
      .then(() => PropertyUtils.callIfPresent(doClose));
  },
});
