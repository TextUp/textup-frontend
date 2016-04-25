import Ember from 'ember';
import defaultIfAbsent from '../../utils/default-if-absent';

export default Ember.Component.extend({
	data: defaultIfAbsent([]),
	selected: null,

	actions: {
		select: function(number, event) {
			return new Ember.RSVP.Promise((resolve, reject) => {
				this.set('selected', number);
				resolve();
			});
		},
		deselect: function(number) {
			this.set('selected', null);
		},
	}
});
