import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
	attrs: {
		tags: {
			deserialize: 'records',
			serialize: false //any changes happen with tagActions on the individual tags
		},
	},
});