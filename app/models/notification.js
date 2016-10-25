import DS from 'ember-data';
import Ember from 'ember';

const {
	equal: eq
} = Ember.computed;

export default DS.Model.extend({

	ownerType: DS.attr('string'),
	ownerId: DS.attr('string'),
	ownerName: DS.attr('string'),
	ownerNumber: DS.attr('string'),
	contents: DS.attr('string'),
	outgoing: DS.attr('boolean'),
	otherType: DS.attr('string'),
	otherId: DS.attr('string'),
	otherName: DS.attr('string'),

	// Computed properties
	// -------------------

	isOwnerTeam: eq('ownerType', 'team'),
	isOtherTag: eq('otherType', 'tag'),
	ownerUrlIdentifier: Ember.computed('ownerId', function() {
		return Ember.String.dasherize(this.get('ownerId') || '');
	}),
	otherUrlIdentifier: Ember.computed('otherId', function() {
		return Ember.String.dasherize(this.get('otherId') || '');
	})
});
