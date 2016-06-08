import DS from 'ember-data';
import NewPhone from '../mixins/new-phone-serializer';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, NewPhone, {
	attrs: {
		org: {
			serialize: 'ids'
		},
		location: {
			deserialize: 'records',
			serialize: 'records'
		},
		phone: {
			deserialize: 'records',
			serialize: 'records'
		},
		numMembers: {
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
