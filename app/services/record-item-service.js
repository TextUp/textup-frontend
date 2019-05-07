import ArrayUtils from 'textup-frontend/utils/array';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import FileUtils from 'textup-frontend/utils/file';
import LocaleUtils from 'textup-frontend/utils/locale';
import moment from 'moment';
import TypeUtils from 'textup-frontend/utils/type';

const { assign, isArray, get, RSVP } = Ember;

export const FALLBACK_FILE_NAME = 'textup-export.pdf';

export default Ember.Service.extend({
  authService: Ember.inject.service(),
  dataService: Ember.inject.service(),
  renewTokenService: Ember.inject.service(),
  requestService: Ember.inject.service(),
  stateService: Ember.inject.service(),
  store: Ember.inject.service(),

  loadRecordItems(model, { refresh } = { refresh: false }) {
    return new RSVP.Promise((resolve, reject) => {
      const query = this._buildQueryFor([model]);
      query.max = 20;
      if (!refresh) {
        query.offset = model.get('numRecordItems');
      }
      this.get('requestService')
        .handleIfError(this.get('store').query('record-item', query))
        .then(results => {
          model.set('totalNumRecordItems', get(results, 'meta.total'));
          resolve(results);
        }, reject);
    });
  },

  // if no record owners specified, will just return export for all records for the currently-active phone
  /* jshint unused:vars */
  exportRecordItems(dateStart, dateEnd, shouldGroup, recordOwners = [], alreadyRetried = false) {
    return new RSVP.Promise((resolve, reject) => {
      const query = {
        teamId: this.get('stateService.ownerAsTeam.id'),
        timezone: LocaleUtils.getTimezone(),
        format: Constants.EXPORT.FORMAT.PDF,
        max: Constants.EXPORT.LARGEST_MAX,
        start: moment(dateStart).toISOString(),
        end: moment(dateEnd).toISOString(),
        exportFormatType: shouldGroup
          ? Constants.EXPORT.TYPE.GROUPED
          : Constants.EXPORT.TYPE.SINGLE,
      };
      assign(query, this._buildQueryFor(recordOwners));
      // Need to use XHR directy because jQuery does not support XHR2 responseType of `arrayBuffer`
      // We need this because the server returns the raw binary data. In order for the binary data
      // to be properly outputted in the handler, we need to specify the `arrayBuffer` responseType
      // For browser support: https://caniuse.com/#feat=xhr2
      // [NOTE] not using jQuery means that we will need to manually add in renew token logic
      var xhr = new XMLHttpRequest();
      xhr.open(Constants.REQUEST_METHOD.GET, `${config.host}/v1/records?${Ember.$.param(query)}`);
      xhr.responseType = 'arraybuffer';
      xhr.setRequestHeader(Constants.REQUEST_HEADER.CONTENT_TYPE, Constants.MIME_TYPE.PDF);
      xhr.setRequestHeader(Constants.REQUEST_HEADER.AUTH, this.get('authService.authHeader'));
      xhr.onload = this._handleExportOutcome.bind(
        this,
        [dateStart, dateEnd, shouldGroup, recordOwners, alreadyRetried],
        xhr,
        resolve,
        reject
      );
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

  endOngoingCall(rCall) {
    if (TypeUtils.isCall(rCall)) {
      rCall.set('endOngoing', true);
      this.get('dataService').persist(rCall);
    }
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
    return {
      owners: ArrayUtils.ensureArrayAndAllDefined(models)
        .filter(TypeUtils.isAnyModel)
        .mapBy('id'),
    };
  },
  _handleExportOutcome(originalArguments, xhr, resolve, reject) {
    const alreadyRetried = originalArguments[originalArguments.length - 1];
    if (xhr.status === Constants.RESPONSE_STATUS.OK) {
      FileUtils.download(
        xhr.response,
        Constants.MIME_TYPE.PDF,
        FileUtils.tryGetFileNameFromXHR(xhr, FALLBACK_FILE_NAME)
      );
      resolve();
    } else if (xhr.status === Constants.RESPONSE_STATUS.UNAUTHORIZED && !alreadyRetried) {
      const retryArgs = [...originalArguments];
      retryArgs[retryArgs.length - 1] = true; // set the last arg `alreadyRetried` to true
      this.get('renewTokenService')
        .tryRenewToken()
        .then(() => this.exportRecordItems(...retryArgs), reject)
        .then(resolve, reject);
    } else {
      reject();
    }
  },
});
