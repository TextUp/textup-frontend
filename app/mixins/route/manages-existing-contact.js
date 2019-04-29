import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

export default Ember.Mixin.create({
  contactService: Ember.inject.service(),
  dataService: Ember.inject.service(),

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

    goToDuplicateContact(dupId) {
      this.send('cancelExistingContactSlideout');
      this.transitionTo(this.get('routeName'), dupId);
    },
    onAddNumber() {
      this.get('contactService').checkNumberDuplicate(this.get('currentModel'), ...arguments);
    },
    onRemoveNumber() {
      this.get('contactService').removeNumberDuplicate(this.get('currentModel'), ...arguments);
    },
  },
});
