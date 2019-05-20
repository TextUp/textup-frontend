import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';

export default Mixin.create({
  contactService: service(),
  tutorialService: service(),

  setupController(controller) {
    this._super(...arguments);
    controller.setProperties({ newContact: null });
  },

  actions: {
    startNewContactSlideout() {
      this.get('controller').set('newContact', this.get('contactService').createNew());
      this.send(
        'toggleSlideout',
        'slideouts/contact/create',
        AppUtils.controllerNameForRoute(this),
        Constants.SLIDEOUT.OUTLET.DEFAULT
      );
    },
    cancelNewContactSlideout() {
      const newContact = this.get('controller.newContact');
      if (newContact) {
        newContact.rollbackAttributes();
      }
      this.send('closeSlideout');
    },
    finishNewContactSlideout() {
      return this.get('contactService')
        .persistNewAndTryAddToPhone(this.get('controller.newContact'))
        .then(() => {
          this.send('closeSlideout');
          this.get('tutorialService').startCompleteTask(Constants.TASK.CONTACT);
          this.get('controller').set('newContact', null);
        });
    },
    newContactGoToDuplicateContact(dupId) {
      this.send('cancelNewContactSlideout');
      this.transitionTo('main.contacts.contact', dupId);
    },
  },
});
