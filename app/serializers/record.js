import Ember from 'ember';
import DS from 'ember-data';

const { get, isEmpty, isPresent } = Ember;

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    whenCreated: {
      serialize: false
    },
    type: {
      serialize: false
    },
    outgoing: {
      serialize: false
    },
    hasAwayMessage: {
      serialize: false
    },

    authorName: {
      serialize: false
    },
    authorId: {
      serialize: false
    },
    authorType: {
      serialize: false
    },

    contact: {
      serialize: false
    },
    tag: {
      serialize: false
    },
    receipts: {
      deserialize: 'records',
      serialize: false
    },

    durationInSeconds: {
      serialize: false
    },
    hasVoicemail: {
      serialize: false
    },
    voicemailUrl: {
      serialize: false
    },
    voicemailInSeconds: {
      serialize: false
    },
    callContents: {
      serialize: false
    },

    location: {
      deserialize: 'records',
      serialize: 'records'
    },
    _originallyHasLocation: {
      serialize: false
    },
    whenChanged: {
      serialize: false
    },
    hasBeenDeleted: {
      key: 'isDeleted',
      serialize: false
    },
    unsortedRevisions: {
      key: 'revisions',
      deserialize: 'records',
      serialize: false
    },
    images: {
      serialize: false
    },
    uploadErrors: {
      serialize: false
    }
  },

  serialize: function(snapshot) {
    const json = this._super(...arguments),
      record = snapshot.record,
      recipients = record.get('recipients');
    if (record.get('isText')) {
      this._buildRecipientsForText(json, recipients);
    } else if (record.get('isCall')) {
      this._buildRecipientsForCall(json, recipients);
    } else {
      // is a note
      this._buildRecipientsForNote(json, recipients);
      const addLocation = record.get('shouldAddLocation'),
        locIsDirty = record.get('location.content.isDirty'),
        addAfter = record.get('doAddAfterThis');
      if (!addLocation && !locIsDirty) {
        delete json.location;
      }
      if (addAfter) {
        // add one millisecond because we don't we want to be AFTER this item
        // so we need to submit a time that is AFTER this item's created time
        // mostly this is because the server implements getSince as ">=" instead of
        // just ">" so passing the time without a millisecond increment would
        // bring up the item we want to insert after
        json.after = new Date(get(addAfter, 'whenCreated').valueOf() + 1);
      }
      if (record.get('toggleNoteDeleteStatus')) {
        json.isDeleted = !record.get('hasBeenDeleted');
      }
      json.doImageActions = this._buildImageActionsForNote(record);
      // if noteContents is null, delete this key instead of passing null because that gets
      // interpreted as the string 'null'
      if (record.get('noteContents') === null) {
        delete json.noteContents;
      }
    }
    // so we don't create new locations (and therefore revisions) we don't need
    record.set('shouldAddLocation', false);
    // set this to null so we don't accidentally send an 'after' anymore
    record.set('doAddAfterThis', null);
    // we need to reset these attributes so the record won't be considered dirty anymore!
    record.set('toggleNoteDeleteStatus', false);
    record.get('recipients').clear();
    return json;
  },
  normalize: function(model, json) {
    json['_originallyHasLocation'] = isPresent(json.location);
    return this._super(...arguments);
  },

  // Receipients
  // -----------

  _buildRecipientsForText: function(json, recipients) {
    if (isEmpty(recipients)) {
      return;
    }
    json.sendToPhoneNumbers = [];
    json.sendToContacts = [];
    json.sendToSharedContacts = [];
    json.sendToTags = [];
    recipients.forEach(recip => {
      if (this._isTag(recip)) {
        json.sendToTags.pushObject(get(recip, 'id'));
      } else if (this._isContact(recip)) {
        json.sendToContacts.pushObject(get(recip, 'id'));
      } else if (this._isShared(recip)) {
        json.sendToSharedContacts.pushObject(get(recip, 'id'));
      } else {
        json.sendToPhoneNumbers.pushObject(get(recip, 'identifier'));
      }
    });
  },
  _buildRecipientsForCall: function(json, recipients) {
    if (isEmpty(recipients)) {
      return;
    }
    const recip = recipients.get('firstObject');
    if (this._isContact(recip)) {
      json.callContact = get(recip, 'id');
    } else {
      json.callSharedContact = get(recip, 'id');
    }
  },
  _buildRecipientsForNote: function(json, recipients) {
    if (isEmpty(recipients)) {
      return;
    }
    const recip = recipients.get('firstObject');
    if (this._isContact(recip)) {
      json.forContact = get(recip, 'id');
    } else if (this._isShared(recip)) {
      json.forSharedContact = get(recip, 'id');
    } else {
      json.forTag = get(recip, 'id');
    }
  },
  _isTag: function(recipient) {
    return get(recipient, 'type') === 'tag';
  },
  _isShared: function(recipient) {
    return get(recipient, 'type') === 'contact' && get(recipient, 'isShared');
  },
  _isContact: function(recipient) {
    return get(recipient, 'type') === 'contact' && !get(recipient, 'isShared');
  },

  // Image actions
  // -------------

  _buildImageActionsForNote: function(recordNote) {
    const actions = [];
    if (recordNote.get('hasImagesToAdd')) {
      recordNote.get('imagesToAdd').forEach(({ mimeType, data, checksum }) => {
        actions.pushObject({
          action: 'ADD',
          mimeType,
          data,
          checksum
        });
      });
    }
    if (recordNote.get('hasImagesToRemove')) {
      recordNote.get('imagesToRemove').forEach(({ key }) => {
        actions.pushObject({
          action: 'REMOVE',
          key
        });
      });
    }
    recordNote.setProperties({
      imagesToAdd: [],
      imagesToRemove: []
    });
    return actions;
  }
});
