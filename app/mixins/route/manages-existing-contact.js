import Ember from 'ember';

export default Ember.Mixin.create({
  contactService: Ember.inject.service(),
  dataService: Ember.inject.service(),

  actions: {
    startExistingContactSlideout() {
      this.send(
        'toggleSlideout',
        'slideouts/contact/edit',
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DETAIL')
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
      this.get('contactService').checkNumberDuplicate(this.get('currentModel'));
    },
    onRemoveNumber() {
      this.get('contactService').removeNumberDuplicate(this.get('currentModel'));
    }
  }
});
