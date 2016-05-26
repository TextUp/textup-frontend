import Ember from 'ember';
import {
	validate as validateNumber,
	clean as cleanNumber
} from '../utils/phone-number';

export default Ember.Controller.extend({
	contacts: [],
	filter: 'all',

	newContact: null,
	newTag: null,

	selectedRecipients: [],
	composeMessage: '',

	hasRecipients: Ember.computed('selectedRecipients.[]', function() {
		return Ember.isPresent(this.get('selectedRecipients'));
	}),

	actions: {

		// Compose
		// -------

		createRecipient: function(val) {
			if (validateNumber(val)) {
				return {
					identifier: cleanNumber(val),
				};
			}
		},
		insertRecipientAt: function(index, recipient) {
			return new Ember.RSVP.Promise((resolve) => {
				this.get('selectedRecipients').replace(index, 1, [recipient]);
				resolve();
			});
		},
		deselectRecipient: function(recipient) {
			this.get('selectedRecipients').removeObject(recipient);
		},
		doSearch: function(searchString) {
			return new Ember.RSVP.Promise((resolve, reject) => {
				if (Ember.isBlank(searchString)) {
					return resolve([]);
				}
				const query = Object.create(null),
					team = this.get('stateManager.ownerAsTeam');
				query.search = searchString;
				if (team) {
					query.teamId = team.get('id');
				}
				this.store.query('contact', query).then((results) => {
					resolve(results.toArray());
				}, reject);
			});
		},
	}
});
