import callIfPresent from 'textup-frontend/utils/call-if-present';
import Ember from 'ember';

export default Ember.Mixin.create({
  dataService: Ember.inject.service(),
  futureMessageService: Ember.inject.service(),

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
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DETAIL')
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
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DETAIL')
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
    }
  },

  _initialFutureMessageProps() {
    return { newFutureMessage: null };
  },
  _tryRevertNewFutureMessage() {
    const newFutureMessage = this.get('controller.newFutureMessage');
    if (newFutureMessage) {
      newFutureMessage.rollbackAttributes();
    }
  }
});
