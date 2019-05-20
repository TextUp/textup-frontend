import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import AppUtils from 'textup-frontend/utils/app';
import callIfPresent from 'textup-frontend/utils/call-if-present';
import Constants from 'textup-frontend/constants';

export default Mixin.create({
  dataService: service(),
  futureMessageService: service(),
  mediaService: service(),

  setupController(controller) {
    this._super(...arguments);
    controller.setProperties(this._initialFutureMessageProps());
  },

  actions: {
    startNewScheduleMessageSlideout() {
      this.get('controller').set(
        'newFutureMessage',
        this.get('futureMessageService').createNew(this.get('currentModel'))
      );
      this.send(
        'toggleSlideout',
        'slideouts/future-message/create',
        AppUtils.controllerNameForRoute(this),
        Constants.SLIDEOUT.OUTLET.DETAIL
      );
    },
    cancelNewScheduleMessageSlideout() {
      this.send('closeSlideout');
      this._tryRevertNewFutureMessage();
    },
    finishNewScheduleMessageSlideout() {
      return this.get('futureMessageService')
        .persistNew(this.get('controller.newFutureMessage'))
        .then(() => this.send('closeSlideout'));
    },

    startViewScheduledMessagesSlideout() {
      this.send(
        'toggleSlideout',
        'slideouts/future-message/list',
        AppUtils.controllerNameForRoute(this),
        Constants.SLIDEOUT.OUTLET.DETAIL
      );
    },
    finishViewScheduledMessagesSlideout() {
      this.send('closeSlideout');
    },

    onFutureMessageMarkForDelete(fMessage) {
      this.get('dataService').markForDelete(fMessage);
    },
    onFutureMessageUndoDelete(fMessage) {
      fMessage.rollbackAttributes();
    },
    onFutureMessageCancelEditing(fMessage, doClose) {
      fMessage.rollbackAttributes();
      callIfPresent(this, doClose);
    },
    onFutureMessageSaveEditing(fMessage, doClose) {
      return this.get('dataService')
        .persist(fMessage)
        .then(() => callIfPresent(this, doClose));
    },
  },

  _initialFutureMessageProps() {
    return { newFutureMessage: null };
  },
  _tryRevertNewFutureMessage() {
    const newFutureMessage = this.get('controller.newFutureMessage');
    if (newFutureMessage) {
      newFutureMessage.rollbackAttributes();
    }
  },
});
