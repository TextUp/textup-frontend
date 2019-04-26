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
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DEFAULT')
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
        .persistNew(this.get('controller.newContact'), {
          displayedList: this.get('controller.contacts'),
          currentFilter: this.get('controller.filter'),
        })
        .then(() => {
          this.send('closeSlideout');
          this.get('tutorialService').startCompleteTask('addContact');
          this.get('controller').set('newContact', null);
        });
    },
    goToDuplicateContact(dupId) {
      this.send('cancelNewContactSlideout');
      this.transitionTo('main.contacts.contact', dupId);
    },
    onAddNumber() {
      this.get('contactService').checkNumberDuplicate(this.get('controller.newContact'));
    },
    onRemoveNumber() {
      this.get('contactService').removeNumberDuplicate(this.get('controller.newContact'));
    },
  },

  _tryRevertNewContact() {
    const newContact = this.get('controller.newContact');
    if (newContact) {
      newContact.rollbackAttributes();
    }
  },
});
