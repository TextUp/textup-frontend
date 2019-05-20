import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';

export default Mixin.create({
  contactService: service(),
  dataService: service(),

  actions: {
    startExistingContactSlideout() {
      this.send(
        'toggleSlideout',
        'slideouts/contact/edit',
        AppUtils.controllerNameForRoute(this),
        Constants.SLIDEOUT.OUTLET.DETAIL
      );
    },
    cancelExistingContactSlideout() {
      this.get('currentModel').rollbackAttributes();
      this.send('closeSlideout');
    },
    finishExistingContactSlideout() {
      return this.get('dataService')
        .persist(this.get('currentModel'))
        .then(() => this.send('closeSlideout'));
    },

    existingContactGoToDuplicateContact(dupId) {
      this.send('cancelExistingContactSlideout');
      this.transitionTo(this.get('routeName'), dupId);
    },
  },
});
