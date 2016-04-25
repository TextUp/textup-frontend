import Ember from 'ember';

export default Ember.Controller.extend({
	selected: null,

	actions: {
		select: function(org, event) {
			console.log('select');
			console.log(org);

			return new Ember.RSVP.Promise((resolve, reject) => {
				this.set('selected', org);
				resolve();
			});
		},
		deselect: function() {
			console.log('deselect');

			this.set('selected', null);
		},
		search: function(val) {
			console.log('search: val: ' + val);

			return new Ember.RSVP.Promise((resolve, reject) => {
				const orgs = [{
					id: 1,
					name: 'Organization 1',
					address: 'South Street Complex Building 1 Site 123 Plot 9032, 1234 Kiki Road Suite 123 Room 290, Providence, RI, 02912'
				}, {
					id: 2,
					name: 'Organization 2',
					address: '1234 Kiki Road Suite 888, Providence, RI, 02912'
				}];
				setTimeout(function() {
					resolve(orgs);
				}, 500);
			});
		}
	}
});
