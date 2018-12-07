import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import moment from 'moment';
import { tryGetFileNameFromXHR, download } from 'textup-frontend/utils/file';

const { assign, isArray, get } = Ember;

export default Ember.Service.extend({
  authService: Ember.inject.service(),
  constants: Ember.inject.service(),
  dataService: Ember.inject.service(),
  stateManager: Ember.inject.service('state'),
  store: Ember.inject.service(),

  loadRecordItems(model, { refresh } = { refresh: false }) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const query = this._buildQueryFor([model]);
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

  // if no record owners specified, will just return export for all records for the
  // currently-active phone
  exportRecordItems(dateStart, dateEnd, shouldGroupEntities, recordOwners = []) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const constants = this.get('constants'),
        query = {
          teamId: this.get('stateManager.ownerAsTeam.id'),
          format: constants.EXPORT.FORMAT.PDF,
          max: constants.EXPORT.LARGEST_MAX,
          since: moment(dateStart).toISOString(),
          before: moment(dateEnd).toISOString(),
          exportFormatType: shouldGroupEntities
            ? constants.EXPORT.TYPE.GROUPED
            : constants.EXPORT.TYPE.SINGLE
        };
      assign(query, this._buildQueryFor(recordOwners));
      // Need to use XHR directy because jQuery does not support XHR2 responseType of `arrayBuffer`
      // We need this because the server returns the raw binary data. In order for the binary data
      // to be properly outputted in the handler, we need to specify the `arrayBuffer` responseType
      // For browser support: https://caniuse.com/#feat=xhr2
      var xhr = new XMLHttpRequest();
      xhr.open('GET', `${config.host}/v1/records?${Ember.$.param(query)}`);
      xhr.responseType = 'arraybuffer';
      xhr.setRequestHeader('Content-Type', constants.MIME_TYPE.PDF);
      xhr.setRequestHeader('Authorization', `Bearer ${this.get('authService.token')}`);
      xhr.onload = () => this._handleExportOutcome(xhr, resolve, reject);
      xhr.send();
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

  _buildQueryFor(models) {
    const constants = this.get('constants'),
      contactIds = [],
      sharedContactIds = [],
      tagIds = [];
    if (isArray(models)) {
      models.forEach(model => {
        switch (model.get('constructor.modelName')) {
          case constants.MODEL.CONTACT:
            if (model.get('isShared')) {
              sharedContactIds.pushObject(model.get('id'));
            } else {
              contactIds.pushObject(model.get('id'));
            }
            break;
          case constants.MODEL.TAG:
            tagIds.pushObject(model.get('id'));
            break;
        }
      });
    }
    return { contactIds, sharedContactIds, tagIds };
  },

  _handleExportOutcome(xhr, resolve, reject) {
    if (xhr.status === 200) {
      const fileType = this.get('constants.MIME_TYPE.PDF'),
        fallbackName = 'textup-export.pdf';
      download(xhr.response, fileType, tryGetFileNameFromXHR(xhr, fallbackName));
      resolve();
    } else {
      reject();
    }
  }
});
