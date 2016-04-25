import Ember from 'ember';

export default Ember.Controller.extend({
	numbers: [{
		number: '111 222 3333',
		region: 'RI, US'
	}, {
		number: '222 222 3333',
	}, {
		number: '333 222 3333',
		region: 'RI, US'
	}, {
		number: '444 222 3333',
		region: 'RI, US'
	}, {
		number: '555 222 3333',
		region: 'RI, US'
	}, {
		number: '777 222 3333',
	}],
	selected: null,
});
