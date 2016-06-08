import DS from 'ember-data';
import NewPhone from '../mixins/new-phone-serializer';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, NewPhone, {
	attrs: {
		org: {
			deserialize: 'records',
			serialize: 'ids'
		},
		schedule: {
			deserialize: 'records',
			serialize: 'records'
		},
		phone: {
			deserialize: 'records',
			serialize: 'records'
		},
		teams: {
			deserialize: 'records',
			serialize: false //any changes happen with teamActions on the individual tags
		}
	},

	serialize: function() {
		const json = this._super(...arguments);
		json.org = {
			id: json.org
		};
		if (!json.password) {
			delete json.password;
		}
		return json;
	},
});
