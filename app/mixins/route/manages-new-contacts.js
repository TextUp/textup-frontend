import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

export default Ember.Mixin.create({
  contactService: Ember.inject.service(),
  tutorialService: Ember.inject.service(),

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
      this._tryRevertNewContact();
      this.send('closeSlideout');
      // nullify newContact to avoid sortable numbers component setting
      // a copied version of the numbers array after the newContact is
      // rolled back (thus deleted) which triggers an error from ember data
      this.get('controller').set('newContact', null);
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

  _tryRevertNewContact() {
    const newContact = this.get('controller.newContact');
    if (newContact) {
      newContact.rollbackAttributes();
    }
  },
});
