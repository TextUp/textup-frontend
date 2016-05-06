import Ember from 'ember';
import defaultIfAbsent from '../../utils/default-if-absent';
import {
	validate as validateNumber,
	clean as cleanNumber
} from '../../utils/phone-number';

export default Ember.Component.extend({

	numbers: defaultIfAbsent([]),
	newNumber: defaultIfAbsent(''),

	classNames: 'sortable-group-numbers',

	// Computed properties
	// -------------------

	hasNumbers: Ember.computed.notEmpty('numbers'),

	// Events
	// ------

	didInsertElement: function() {
		this._super(...arguments);
		// need to do this to trigger changedAttributes for numbers
		Ember.run.scheduleOnce('afterRender', this, function() {
			// true passed to copy for DEEP COPY so that before and after
			// in changed attributes does not return the same mutated version
			this.set('numbers', Ember.copy(this.get('numbers'), true));
		});
	},

	// Actions
	// -------

	actions: {
		storeNewNumber: function(val) {
			this.set('newNumber', val);
		},
		clearNew: function(event) {
			this.set('newNumber', '');
		},
		addNewNumber: function(val, isValid) {
			if (isValid) {
				this.get('numbers').pushObject({
					number: val
				});
				this.set('newNumber', '');
			}
		},
		removeNumber: function(index) {
			this.get('numbers').removeAt(index);
		},
		removeIfEmpty: function(index, val) {
			if (Ember.isBlank(val)) {
				this.get('numbers').removeAt(index);
			}
		},
		updateNumber: function(numObj, index, newVal) {
			Ember.set(numObj, 'number', newVal);
		},
		reorderNumbers: function(itemModels) {
			this.set('numbers', itemModels);
		},
	}
});
