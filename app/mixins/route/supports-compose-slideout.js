import Ember from 'ember';

const { typeOf, copy, get } = Ember;

export default Ember.Mixin.create({
  composeSlideoutService: Ember.inject.service(),
  dataService: Ember.inject.service(),
  recordItemService: Ember.inject.service(),

  setupController(controller) {
    this._super(...arguments);
    controller.setProperties(this._initialComposeProps());
  },

  actions: {
    startComposeSlideout(recipientsOrEventObj) {
      const recipients = typeOf(recipientsOrEventObj) === 'array' ? copy(recipientsOrEventObj) : [];
      this.get('controller').setProperties({ composeRecipients: recipients });
      this.send(
        'toggleSlideout',
        'slideouts/compose',
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DEFAULT')
      );
    },
    cancelComposeSlideout() {
      this.get('controller').setProperties(this._initialComposeProps());
      this.send('closeSlideout');
    },
    finishComposeSlideout() {
      // [FUTURE] need to revert new numbers back to their original string-only form to be
      // compatible with adding recipients on the record item. Need to revamp recipients handling
      // in the multi-select in the future.
      const contents = this.get('controller.composeMessage'),
        recipients = this.get('controller.composeRecipients').map(recipient => {
          return get(recipient, 'constructor.modelName') ? recipient : get(recipient, 'identifier');
        }),
        rText = this.get('recordItemService').createNewText(recipients, { contents });
      this.get('dataService')
        .persist(rText)
        .then(() => this.send('cancelComposeSlideout'))
        .catch(() => rText.rollbackAttributes());
    },

    composeDoSearch() {
      return this.get('composeSlideoutService').doSearch(...arguments);
    },
    composeCreateRecipient() {
      return this.get('composeSlideoutService').createRecipient(...arguments);
    },
    composeInsertRecipient(index, recipient) {
      return new Ember.RSVP.Promise(resolve => {
        this.get('controller.composeRecipients').replace(index, 1, [recipient]);
        this._checkComposeHasRecipients();
        resolve();
      });
    },
    composeRemoveRecipient(recipient) {
      this.get('controller.composeRecipients').removeObject(recipient);
      this._checkComposeHasRecipients();
    }
  },

  _initialComposeProps() {
    return { composeRecipients: [], composeMessage: '', composeHasRecipients: false };
  },
  _checkComposeHasRecipients() {
    const controller = this.get('controller');
    controller.set('composeHasRecipients', controller.get('composeRecipients.length') > 0);
  }
});
