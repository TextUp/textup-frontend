import Ember from 'ember';

const { isArray, get } = Ember;

export default Ember.Service.extend({
  constants: Ember.inject.service(),
  dataService: Ember.inject.service(),
  store: Ember.inject.service(),

  loadRecordItems(model, { refresh } = { refresh: false }) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const query = this._buildQueryFor(model);
      query.max = 20;
      if (!refresh) {
        query.offset = model.get('numRecordItems');
      }
      this.get('store')
        .query('record-item', query)
        .then(results => {
          model.set('totalNumRecordItems', get(results, 'meta.total'));
          resolve(results);
        }, this.get('dataService').buildErrorHandler(reject));
    });
  },

  makeCall(recipient) {
    const rCall = this.get('store').createRecord('record-call');
    rCall.addRecipient(recipient);
    return this.get('dataService').persist(rCall);
  },
  createNewText(recipients, createInfo = {}) {
    const recipientsArray = isArray(recipients) ? recipients : [recipients],
      rText = this.get('store').createRecord('record-text', createInfo);
    recipientsArray.forEach(recipient => rText.addRecipient(recipient));
    return rText;
  },
  createNewNote(recipient, addAfterRecordItem = null) {
    const rNote = this.get('store').createRecord('record-note');
    rNote.addRecipient(recipient);
    rNote.addAfter(addAfterRecordItem);
    return rNote;
  },

  addLocationToNote(rNote) {
    rNote.set('location', this.get('store').createRecord('location'));
  },
  removeLocationFromNote(rNote) {
    const loc = rNote.get('location.content');
    if (loc) {
      loc.rollbackAttributes();
    }
    rNote.set('location', null);
  },

  // Internal methods
  // ----------------

  _buildQueryFor(model) {
    const constants = this.get('constants'),
      query = Object.create(null);
    switch (model.get('constructor.modelName')) {
      case constants.MODEL.CONTACT:
        query.contactId = model.get('id');
        break;
      case constants.MODEL.TAG:
        query.tagId = model.get('id');
        break;
    }
    return query;
  }
});
