import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		updateNumber: function(newNum, isValid) {
			this.set('personalNumber', newNum);
			return false;
		},
		validateNumber: function(validationCode, newNum) {
			console.log('validateNumber');
			return new Ember.RSVP.Promise(function(resolve) {
				resolve();
			});
		},
	}
});
