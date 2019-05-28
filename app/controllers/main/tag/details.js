import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Controller from '@ember/controller';
import PropertyUtils from 'textup-frontend/utils/property';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default Controller.extend({
  dataService: service(),
  recordItemService: service(),
  tutorialService: service(),

  careRecordText: null,
  careRecordRef: null,

  actions: {
    onLoadRecordItems() {
      return this.get('recordItemService')
        .loadRecordItems(this.get('model'))
        .then(() => PropertyUtils.callIfPresent(this.get('careRecordRef.actions.restorePosition')));
    },
    onRefreshRecordItems() {
      return this.get('recordItemService').loadRecordItems(this.get('model'), {
        refresh: true,
      });
    },

    onCall() {
      return new RSVP.Promise((resolve, reject) => {
        this.get('recordItemService')
          .makeCall(this.get('model'))
          .then(() => {
            this.get('tutorialService').startCompleteTask(Constants.TASK.CALL);
            resolve();
          })
          .catch(reject);
      });
    },
    onText() {
      return this.get('dataService')
        .persist(this.get('careRecordText'))
        .then(() => {
          this.setupNewRecordText(this.get('model'));
          this.get('tutorialService').startCompleteTask(Constants.TASK.MESSAGE);
        });
    },
  },

  setupNewRecordText(recordOwner) {
    this.set('careRecordText', this.get('recordItemService').createNewText(recordOwner));
  },
  resetState() {
    AppUtils.tryRollback(this.get('careRecordText'));
    PropertyUtils.callIfPresent(this.get('careRecordRef.actions.resetAll'));
  },
});
