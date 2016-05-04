import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
	attrs: {
		sharedWith: {
			deserialize: 'records',
			serialize: false //any changes happen with shareActions
		},
		tags: {
			deserialize: 'records',
			serialize: false //any changes happen in tag's tagActions
		},
		records: {
			deserialize: 'records',
			serialize: false //any changes happen at records endpoint
		},
		numbers: {
			deserialize: 'records',
			serialize: false //any changes happen with numberActions
		},
		lastRecordActivity: {
			serialize: false
		},
		sharedBy: {
			serialize: false
		},
		sharedById: {
			serialize: false
		},
		startedSharing: {
			serialize: false
		},
		permission: {
			serialize: false
		}
	},
});
