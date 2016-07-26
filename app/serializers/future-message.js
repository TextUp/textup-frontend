import DS from 'ember-data';
import Ember from 'ember';

export default DS.RESTSerializer.extend({
	attrs: {
		whenCreated: {
			serialize: false
		},
		nextFireDate: {
			serialize: false
		},
		isDone: {
			serialize: false
		},
		isRepeating: {
			serialize: false
		},
		hasEndDate: {
			serialize: false
		},
		timesTriggered: {
			serialize: false
		},
		contact: {
			serialize: false
		},
		tag: {
			serialize: false
		}
	},

	payloadKeyFromModelName: function(modelName) {
		return Ember.String.dasherize(modelName);
	},
	serialize: function(snapshot) {
		const json = this._super(...arguments),
			model = snapshot.record;
		json.repeatIntervalInDays *= model.get('intervalMultiplier');
		if (model.get('isRepeating')) {
			if (model.get('hasEndDate')) {
				json.repeatCount = null;
			} else {
				json.endDate = null;
			}
		} else {
			delete json.repeatIntervalInDays;
			delete json.repeatCount;
			delete json.endDate;
		}
		return json;
	}
});
