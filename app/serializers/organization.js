import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
	attrs: {
		teams: {
			deserialize: 'records',
			serialize: false //any changes happen with teamActions on the individual tags
		},
		numAdmins: {
			serialize: false
		},
		location: {
			deserialize: 'records',
			serialize: 'records'
		}
	},
});
