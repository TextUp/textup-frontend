import ApplicationAdapter from './application';
import Ember from 'ember';
import tz from 'npm:jstz';

export default ApplicationAdapter.extend({
	timezone: Ember.computed(function() {
		return tz.determine().name();
	}),
	buildURL: function() {
		const url = this._super(...arguments),
			timezone = this.get('timezone');
		return `${url}?timezone=${timezone}`;
	}
});
