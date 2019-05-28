import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
  contactService: service(),
  router: service(),
  slideoutService: service(),
  tutorialService: service(),

  // Properties
  // ----------

  newContact: null,

  // Methods
  // -------

  openSlideout() {
    this.set('newContact', this.get('contactService').createNew());
    this.get('slideoutService').toggleSlideout(
      'slideouts/contact/create',
      Constants.SLIDEOUT.OUTLET.DEFAULT
    );
  },
  cancelSlideout() {
    AppUtils.tryRollback(this.get('newContact'));
    this.get('slideoutService').closeSlideout();
  },
  finishSlideout() {
    return this.get('contactService')
      .persistNew(this.get('newContact'))
      .then(() => {
        this.cancelSlideout();
        this.get('tutorialService').startCompleteTask(Constants.TASK.CONTACT);
      });
  },
  goToDuplicate(contactId) {
    this.cancelSlideout();
    this.get('router').transitionTo('main.contacts.contact', contactId);
  },
});
