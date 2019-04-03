import Ember from 'ember';

const { tryInvoke } = Ember;

export default Ember.Mixin.create({
  dataService: Ember.inject.service(),
  mediaService: Ember.inject.service(),
  recordItemService: Ember.inject.service(),

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
      return this.get('recordItemService').loadRecordItems(this.get('currentModel'));
    },
    onRefreshRecordItems() {
      return this.get('recordItemService').loadRecordItems(this.get('currentModel'), {
        refresh: true,
      });
    },

    onCall() {
      return this.get('recordItemService').makeCall(this.get('currentModel'));
    },
    onText() {
      return this.get('dataService')
        .persist(this.get('controller.careRecordText'))
        .then(() => this._initCareRecordText());
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
  _resetCareRecord() {
    const careRecordRef = this.get('controller.careRecordRef');
    if (careRecordRef && careRecordRef.actions) {
      tryInvoke(careRecordRef.actions, 'reset');
    }
  },
});
