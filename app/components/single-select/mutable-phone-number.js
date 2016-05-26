import Ember from 'ember';
import defaultIfAbsent from '../../utils/default-if-absent';

export default Ember.Component.extend({
	data: defaultIfAbsent([]),
	selected: null,

	// Computed properties
	// -------------------

	dataIsPromise: Ember.computed('data', function() {
		return Ember.isPresent(this.get('data.then'));
	}),

	actions: {
		select: function(numObj) {
			return new Ember.RSVP.Promise((resolve) => {
				this.set('selected', numObj);
				resolve();
			});
		},
		deselect: function() {
			this.set('selected', null);
		},
	}
});
