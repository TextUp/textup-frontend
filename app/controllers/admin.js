import Ember from 'ember';

export default Ember.Controller.extend({
	filter: 'active',
	pending: [],
	numPending: null,
	people: [],
});
