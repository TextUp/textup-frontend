import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
	attrs: {
		lastRecordActivity: {
			serialize: false
		},
		numMembers: {
			serialize: false
		},
	},

	serialize: function(snapshot) {
		const json = this._super(...arguments),
			actions = snapshot.record.get('actions');
		if (actions) {
			json.doTagActions = actions.map(this._convertToTagAction);
			actions.clear();
		}
		return json;
	},

	// Helpers
	// -------

	_convertToTagAction: function(action) {
		if (!action) {
			return action;
		}
		action.id = action.itemId;
		delete action.bucketId;
		delete action.itemId;
		return action;
	},
});
