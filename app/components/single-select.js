import Ember from 'ember';
import callIfPresent from '../utils/call-if-present';

export default Ember.Component.extend({
	inputComponent: 'single-select/input',
	selected: null,
	onInsert: null,

	// Computed properties
	// -------------------

	selectedArray: Ember.computed('selected', function() {
		const selected = this.get('selected');
		return Ember.isArray(selected) ? selected :
			(Ember.isPresent(selected) ? [selected] : []);
	}),

	// Actions
	// -------

	actions: {
		select: function(index, number, event) {
			return callIfPresent(this.get('onInsert'), number, event);
		}
	}
});
