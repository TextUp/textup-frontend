import Ember from 'ember';

export default Ember.Controller.extend({

	people: [],
	numPeople: 25,

	actions: {
		loadMore: function() {
			this.get('people').pushObjects(this.loadMore());
			return new Ember.RSVP.Promise(function(resolve, reject) {
				Ember.run.later(this, resolve, 2000);
			});
		},
	},

	loadInitial: function() {
		this.set('people', [{
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
		}, {
			name: 'Jack Kornfield',
			username: 'pathWithHeart',
			status: 'ADMIN',
			teams: [{
				name: "Outreach",
				color: "yellow"
			}]
		}]);
		this.get('people').pushObjects(this.loadMore());
	},
	loadMore: function() {
		const toBeAdded = [],
			numToAdd = 10;

		while (toBeAdded.length < numToAdd) {
			const rand = Math.random(),
				rand2 = Math.random();
			let teams = [{
				name: "Rapid Rehousing",
				color: "purple"
			}, {
				name: "Housing First",
				color: "orange"
			}];
			if (rand2 > 0.5) {
				teams = [];
			} else if (rand > 0.5) {
				teams = [{
					name: "Outreach",
					color: "yellow"
				}];
			}
			toBeAdded.pushObject({
				name: Math.round(rand * 100) + ' NAME!',
				username: Math.round(rand2 * 10) + ' username',
				email: Math.round(rand2 * 10) + '@textup.org',
				status: (rand > 0.5) ? 'STAFF' : 'ADMIN',
				teams: teams
			});
		}

		return toBeAdded;
	}
});
