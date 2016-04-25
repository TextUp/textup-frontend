import Ember from 'ember';

export default Ember.Controller.extend({
	people: [{
		name: 'Kiki Bai',
		username: 'kbai888',
		status: 'STAFF',
		teams: [{
			name: "Rapid Rehousing",
			color: "purple"
		}, {
			name: "Housing First",
			color: "orange"
		}]
	}, {
		name: 'Cho Chang',
		username: 'domoarigato',
		status: 'ADMIN',
		teams: [{
			name: "Housing First",
			color: "orange"
		}]
	}, {
		name: 'What Cheer',
		username: 'cheerful123',
		status: 'STAFF',
		teams: [{
			name: "Rapid Rehousing",
			color: "purple"
		}]
	}],
	teams: [{
		name: "Rapid Rehousing",
		numMembers: 23,
		color: "purple"
	}, {
		name: "Housing First",
		numMembers: 9,
		color: "orange"
	}, {
		name: "Outreach",
		numMembers: 2,
		color: "yellow"
	}, {
		name: "Cleanup Crew",
		numMembers: 5,
		color: "pink"
	}],
});
