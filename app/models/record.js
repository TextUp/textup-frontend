import DS from 'ember-data';
import Ember from 'ember';

// Cannot create polymorphic subclasses because
// we load records from the 'records' endpoint
const {
	equal: eq,
} = Ember.computed;

export default DS.Model.extend({
	whenCreated: DS.attr('date'),
	outgoing: DS.attr('boolean'),
	hasAwayMessage: DS.attr('boolean'),
	type: DS.attr('string'), // call | text

	authorName: DS.attr('string'),
	authorId: DS.attr('number'),
	authorType: DS.attr('string'),

	receipts: DS.hasMany('receipts'),
	contact: DS.belongsTo('contact'),

	// Call
	// ----

	durationInSeconds: DS.attr('number'),
	hasVoicemail: DS.attr('boolean'),

	// Call (voicemail)
	// ----------------

	voicemailUrl: DS.attr('string'),
	voicemailInSeconds: DS.attr('number'),

	// Text
	// ----

	contents: DS.attr('string'),

	// Computed properties
	// -------------------

	isText: eq('type', 'TEXT'),
	isCall: eq('type', 'CALL'),

	successes: Ember.computed('receipts', function() {
		return DS.PromiseArray.create({
			promise: new Ember.RSVP.Promise((resolve, reject) => {
				this.get('receipts').then((receipts) => {
					resolve(receipts.filterBy('status', 'SUCCESS'));
				}, reject);
			})
		});
	}),
	numSuccesses: Ember.computed('successes', function() {
		return DS.PromiseObject.create({
			promise: new Ember.RSVP.Promise((resolve, reject) => {
				this.get('successes').then((successes) => {
					resolve(successes.length);
				}, reject);
			})
		});
	}),
});
