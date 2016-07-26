import Ember from 'ember';

export default Ember.Component.extend({
	value: null,

	actions: {
		onSelect: function(newVal) {
			this.set('value', newVal);
		}
	}
});
