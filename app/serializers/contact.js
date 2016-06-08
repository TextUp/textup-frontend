import DS from 'ember-data';
import Ember from 'ember';

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
		unsortedRecords: {
			serialize: false //any changes happen at records endpoint
		},
		numbers: {
			serialize: false //any changes happen with numberActions
		},
		phone: {
			serialize: false
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
	serialize: function(snapshot) {
		const json = this._super(...arguments),
			changed = snapshot.changedAttributes(),
			numChange = Ember.get(changed, 'numbers'),
			actions = snapshot.record.get('actions');
		if (numChange) {
			json.doNumberActions = this._buildNumberActions(numChange[0] || [],
				numChange[1]);
		}
		if (actions) {
			json.doShareActions = actions.map(this._convertToShareAction);
			actions.clear();
		}
		return json;
	},

	// Sharing
	// -------

	_convertToShareAction: function(action) {
		if (!action) {
			return action;
		}
		if (action.action && action.action.toUpperCase() !== 'STOP') {
			action.permission = action.action;
			action.action = 'MERGE';
		}
		action.id = action.bucketId;
		delete action.bucketId;
		delete action.itemId;
		return action;
	},

	// Numbers
	// -------

	_buildNumberActions: function(originalNumbers, newNumbers) {
		const doNumberActions = [];
		// merge numbers
		newNumbers.forEach((numObj, index) => {
			const number = Ember.get(numObj, 'number'),
				foundNum = originalNumbers.findBy('number', number);
			if (foundNum) {
				const oldIndex = originalNumbers.indexOf(foundNum);
				if (oldIndex !== index) {
					doNumberActions.pushObject(this._mergeNumber(number, index));
				}
			} else { // a new number
				doNumberActions.pushObject(this._mergeNumber(number, index));
			}
		});
		// delete numbers
		originalNumbers.forEach((numObj) => {
			const number = Ember.get(numObj, 'number'),
				stillExists = newNumbers.findBy('number', number);
			if (!stillExists) {
				doNumberActions.pushObject(this._deleteNumber(number));
			}
		});
		return doNumberActions;
	},
	_mergeNumber: function(number, preference) {
		return {
			number: number,
			preference: preference,
			action: 'MERGE'
		};
	},
	_deleteNumber: function(number) {
		return {
			number: number,
			action: 'DELETE'
		};
	}
});
