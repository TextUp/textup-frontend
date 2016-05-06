import DS from 'ember-data';
import Ember from 'ember';

const {
	equal: eq
} = Ember.computed;

export default DS.Model.extend({
	status: DS.attr('string'),
	receivedBy: DS.attr('string'),

	// Computed properties
	// -------------------

	isFailed: eq('status', 'FAILED'),
	isPending: eq('status', 'PENDING'),
	isBusy: eq('status', 'BUSY'),
	isSuccess: eq('status', 'SUCCESS'),
});
