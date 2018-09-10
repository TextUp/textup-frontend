import Ember from 'ember';
import RecordItem from 'textup-frontend/models/record-item';
import { MediaImage, API_ID_PROP_NAME } from 'textup-frontend/objects/media-image';

const { get, isArray, isNone } = Ember;

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
          model.set('totalNumRecordItems', results.get('meta.total'));
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
    const rNote = this.get('store').createRecord('recordNote');
    rNote.addRecipient(recipient);
    rNote.addAfter(addAfterRecordItem);
    return rNote;
  },

  addImage(recordItem, newImages) {
    if (!(recordItem instanceof RecordItem) || !isArray(newImages)) {
      return;
    }
    recordItem.get('media').then(foundMedia => {
      const media = foundMedia || this.get('store').createRecord('media');
      newImages.forEach(imageObj => {
        const { mimeType, data, width, height } = imageObj;

        media.addChange(mimeType, data, width, height);
      });
      recordItem.set('media', media);
    });
  },
  removeImage(recordItem, mediaImage) {
    if (!(recordItem instanceof RecordItem) || !(mediaImage instanceof MediaImage)) {
      return;
    }
    recordItem.get('media').then(media => {
      if (isNone(media)) {
        return;
      }
      media.removeElement(get(mediaImage, API_ID_PROP_NAME));
    });
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
