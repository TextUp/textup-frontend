import Ember from 'ember';
import {
	validate as validateNumber,
	clean as cleanNumber
} from '../utils/phone-number';

const {
	alias
} = Ember.computed;

export default Ember.Controller.extend({
	contacts: alias('stateManager.owner.phone.content.contacts'),
	// see main.contacts controller for explanation of _transitioning
	_transitioning: false,
	filter: 'all',

	newContact: null,
	newTag: null,

	selectedRecipients: [],
	composeMessage: '',

	feedbackMessage: '',

	hasRecipients: Ember.computed('selectedRecipients.[]', function() {
		return Ember.isPresent(this.get('selectedRecipients'));
	}),

	actions: {

		// Compose
		// -------

		createRecipient: function(val) {
			if (validateNumber(val)) {
				const num = cleanNumber(val);
				return {
					uniqueIdentifier: num,
					identifier: num
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