import DS from 'ember-data';

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
});
