import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
	attrs: {
		org: {
			deserialize: 'records',
			serialize: false
		},
		schedule: {
			deserialize: 'records',
			serialize: 'records'
		},
		tags: {
			deserialize: 'records',
			serialize: false //any changes happen with tagActions on the individual tags
		},
		teams: {
			deserialize: 'records',
			serialize: false //any changes happen with teamActions on the individual tags
		},
		numContacts: {
			serialize: false
		}
	},
});
