import DS from 'ember-data';
import PhoneNumber from '../mixins/phone-number-serializer';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, PhoneNumber, {
	attrs: {
		org: {
			serialize: 'ids'
		},
		location: {
			deserialize: 'records',
			serialize: 'records'
		},
		tags: {
			deserialize: 'records',
			serialize: false //any changes happen with tagActions on the individual tags
		},
		numMembers: {
			serialize: false
		},
		phoneId: {
			serialize: false
		},
	},

	serialize: function(snapshot) {
		const json = this._super(...arguments),
			actions = snapshot.record.get('actions');
		if (actions) {
			json.doTeamActions = actions.map(this._convertToTeamAction);
			actions.clear();
		}
		return json;
	},

	// Helpers
	// -------

	_convertToTeamAction: function(action) {
		if (!action) {
			return action;
		}
		action.id = action.itemId;
		delete action.bucketId;
		delete action.itemId;
		return action;
	},
});
