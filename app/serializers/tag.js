import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
	attrs: {
		lastRecordActivity: {
			serialize: false
		},
		numMembers: {
			serialize: false
		}
	},
});
