import Ember from 'ember';
import defaultIfAbsent from '../../utils/default-if-absent';

export default Ember.Component.extend({

	numbers: defaultIfAbsent([]),
	newNumber: defaultIfAbsent(''),

	classNames: 'sortable-group-numbers',

	// Computed properties
	// -------------------

	hasNumbers: Ember.computed.notEmpty('numbers'),

	// Actions
	// -------

	actions: {
		storeNewNumber: function(val) {
			this.set('newNumber', val);
			return false;
		},
		clearNew: function(event) {
			this.set('newNumber', '');
			return false;
		},
		addNewNumber: function(val, isValid) {
			this.set('newNumber', '');
			return false;
		},
		updateNumber: function(numObj, newVal) {
			Ember.set(numObj, 'number', newVal);
			return false;
		},
		reorderNumbers: function(itemModels) {
			this.set('numbers', itemModels);
			return false;
		},
	}
});
