import Ember from 'ember';
import DS from 'ember-data';

const {
	get
} = Ember;

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
	},

	serialize: function(snapshot) {
		const json = this._super(...arguments),
			recipients = snapshot.record.get('recipients');
		if (snapshot.record.get('isText')) {
			this._buildRecipientsForText(json, recipients);
		} else {
			this._buildRecipientsForCall(json, recipients);
		}
		snapshot.record.get('recipients').clear();
		return json;
	},

	// Helpers
	// -------

	_buildRecipientsForText: function(json, recipients) {
		if (!recipients) {
			return;
		}
		json.sendToPhoneNumbers = [];
		json.sendToContacts = [];
		json.sendToSharedContacts = [];
		json.sendToTags = [];
		recipients.forEach((recip) => {
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
		if (!recipients) {
			return;
		}
		const recip = recipients.get('firstObject');
		if (this._isContact(recip)) {
			json.callContact = get(recip, 'id');
		} else if (this._isShared(recip)) {
			json.callSharedContact = get(recip, 'id');
		} else {
			json.callPhoneNumber = get(recip, 'identifier');
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
	}
});
