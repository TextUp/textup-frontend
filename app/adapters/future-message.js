import ApplicationAdapter from './application';
import Ember from 'ember';

const {
	dasherize,
	pluralize
} = Ember.String;

export default ApplicationAdapter.extend({

	authManager: Ember.inject.service('auth'),

	pathForType: function(modelName) {
		return pluralize(dasherize(modelName));
	},
	buildURL: function(modelName, id, snapshot, requestType) {
		let url = this._super(...arguments);
		if (requestType === 'createRecord') {
			['contactId', 'tagId'].forEach((fieldName) => {
				const val = snapshot.record.get(fieldName);
				if (val) {
					url = this._addQueryParam(url, fieldName, val);
				}
			});
		}
		return url;
	}
});
