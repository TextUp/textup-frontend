import Ember from 'ember';
import defaultIfAbsent from '../../utils/default-if-absent';

export default Ember.Component.extend({
	value: null,
	trueString: defaultIfAbsent('Yes'),
	falseString: defaultIfAbsent('No'),

	// Computed properties
	// -------------------

	initialSelectFalse: Ember.computed(function() {
		return !this.get('value');
	}),
});
