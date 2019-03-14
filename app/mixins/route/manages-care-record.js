import Ember from 'ember';

const { tryInvoke } = Ember;

export default Ember.Mixin.create({
  dataService: Ember.inject.service(),
  mediaService: Ember.inject.service(),
  recordItemService: Ember.inject.service(),

  setupController(controller) {
    this._super(...arguments);
    controller.setProperties({ careRecordRef: null, careRecordText: null });
  },

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
