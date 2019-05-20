import { Promise } from 'rsvp';
import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { typeOf } from '@ember/utils';
import { copy } from '@ember/object/internals';
import { get } from '@ember/object';
import AppUtils from 'textup-frontend/utils/app';
import TypeUtils from 'textup-frontend/utils/type';
import Constants from 'textup-frontend/constants';

export default Mixin.create({
  composeSlideoutService: service(),
  dataService: service(),
  recordItemService: service(),
  stateService: service(),
  tutorialService: service(),

  setupController(controller) {
    this._super(...arguments);
    controller.setProperties(this._initialComposeProps());
  },

  actions: {
    startComposeSlideout(recipientsOrEventObj) {
      const recipients = typeOf(recipientsOrEventObj) === 'array' ? copy(recipientsOrEventObj) : [];
      this.get('controller').setProperties({ composeRecipients: recipients });
      this._checkComposeHasRecipients();
      this.send(
        'toggleSlideout',
        'slideouts/compose',
        AppUtils.controllerNameForRoute(this),
        Constants.SLIDEOUT.OUTLET.DEFAULT
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
          return TypeUtils.isAnyModel(recipient)
            ? recipient
            : get(recipient, Constants.PROP_NAME.READABLE_IDENT);
        }),
        rText = this.get('recordItemService').createNewText(recipients, { contents });
      this.get('tutorialService').startCompleteTask(Constants.TASK.MESSAGE);
      return this.get('dataService')
        .persist(rText)
        .then(() => {
          this.send('cancelComposeSlideout');
          // [FUTURE] Right now, newly created contacts aren't pushed to the contacts list so the
          // user needs to refresh before seeing the newly-created contacts. Consider making the
          // contacts to phone relationship automatically managed by Ember Data like the
          // record items to record owners
          if (this.get('stateService.viewingContacts')) {
            this.controllerFor('main.contacts').doRefreshContacts();
          }
        })
        .catch(() => rText.rollbackAttributes());
    },

    composeDoSearch() {
      return this.get('composeSlideoutService').doSearch(...arguments);
    },
    composeCreateRecipient() {
      return this.get('composeSlideoutService').createRecipient(...arguments);
    },
    composeInsertRecipient(index, recipient) {
      return new Promise(resolve => {
        this.get('controller.composeRecipients').replace(index, 1, [recipient]);
        this._checkComposeHasRecipients();
        resolve();
      });
    },
    composeRemoveRecipient(recipient) {
      this.get('controller.composeRecipients').removeObject(recipient);
      this._checkComposeHasRecipients();
    },
  },

  _initialComposeProps() {
    return { composeRecipients: [], composeMessage: '', composeHasRecipients: false };
  },
  _checkComposeHasRecipients() {
    const controller = this.get('controller');
    controller.set('composeHasRecipients', controller.get('composeRecipients.length') > 0);
  },
});
