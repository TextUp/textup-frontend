import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { tryInvoke } from '@ember/utils';
import RSVP from 'rsvp';
import Constants from 'textup-frontend/constants';

export default Mixin.create({
  dataService: service(),
  mediaService: service(),
  recordItemService: service(),
  tutorialService: service(),

  // For routes with dynamic segments, each time the model hook is called, the `setupController`
  // hook will also be called. We DO NOT want to set `careRecordRef` and `careRecordText` to null
  // because this will lead us to lose our reference to `careRecordRef`

  actions: {
    willTransition() {
      this._super(...arguments);
      this._clearCareRecordText();
      return true;
    },
    didTransition() {
      this._super(...arguments);
      this._resetCareRecord();
      this._initCareRecordText();
      return true;
    },

    onLoadRecordItems() {
      return this.get('recordItemService')
        .loadRecordItems(this.get('currentModel'))
        .then(() => this._restoreCareRecordPosition());
    },
    onRefreshRecordItems() {
      return this.get('recordItemService').loadRecordItems(this.get('currentModel'), {
        refresh: true,
      });
    },

    onCall() {
      return new RSVP.Promise((resolve, reject) => {
        this.get('recordItemService')
          .makeCall(this.get('currentModel'))
          .then(() => {
            this.get('tutorialService').startCompleteTask(Constants.TASK.CALL);
            resolve();
          })
          .catch(reject);
      });
    },
    onText() {
      return this.get('dataService')
        .persist(this.get('controller.careRecordText'))
        .then(() => {
          this._initCareRecordText();
          this.get('tutorialService').startCompleteTask(Constants.TASK.MESSAGE);
        });
    },

    endOngoingCall(call) {
      this.get('recordItemService').endOngoingCall(call);
    },

    onFinishCareRecordTutorial() {
      this.get('tutorialService').startCompleteTask(Constants.TASK.CLIENT_RECORD);
    },
  },

  _initCareRecordText() {
    this.get('controller').set(
      'careRecordText',
      this.get('recordItemService').createNewText(this.get('currentModel'))
    );
  },
  _clearCareRecordText() {
    const careRecordText = this.get('controller.careRecordText');
    if (careRecordText) {
      careRecordText.rollbackAttributes();
    }
  },
  _restoreCareRecordPosition() {
    const careRecordRef = this.get('controller.careRecordRef');
    if (careRecordRef && careRecordRef.actions) {
      tryInvoke(careRecordRef.actions, 'restorePosition');
    }
  },
  _resetCareRecord() {
    const careRecordRef = this.get('controller.careRecordRef');
    if (careRecordRef && careRecordRef.actions) {
      tryInvoke(careRecordRef.actions, 'resetAll');
    }
  },
});
