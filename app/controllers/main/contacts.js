import Ember from 'ember';

export default Ember.Controller.extend({
	numContacts: 20,
	contacts: [],

	actions: {
		loadMore: function() {
			this.get('contacts').pushObjects(this._buildMoreContacts());

			return new Ember.RSVP.Promise(function(resolve) {
				Ember.run.later(this, resolve, 2000);
			});
		},
	},

	_buildMoreContacts: function() {
		const lastIdSoFar = this.get('contacts.lastObject.id'),
			toBeAdded = [],
			numToAdd = 5;
		while (toBeAdded.length < numToAdd) {
			const rand = Math.random(),
				tags = (rand > 0.5) ? [] : [{
					color: "#1BA5E0",
					name: "Rapid Rehousing"
				}, {
					color: "#f8f",
					name: "Monday Group"
				}];
			toBeAdded.pushObject({
				id: lastIdSoFar + toBeAdded.length,
				status: 'active',
				isShared: false,
				name: rand * 100 + ' NAME',
				timeAgo: Math.round(rand * 10) + ' weeks ago',
				tags: tags
			});
		}
		return toBeAdded;
	},

	_resetContactsToInitial: function() {
		this.set('contacts', [{
			id: 1,
			status: 'unread',
			isShared: false,
			name: 'Mike Lee',
			timeAgo: '3 days ago',
			tags: [{
				color: "#1BA5E0",
				name: "Rapid Rehousing"
			}, {
				color: "#d3d3d3",
				name: "WO"
			}, {
				color: "#f8f",
				name: "Monday Group"
			}],
			sharedWith: [{
				id: 2,
				permission: 'DELEGATE'
			}, {
				id: 4,
				permission: 'VIEW'
			}]
		}, {
			id: 2,
			status: 'active',
			isShared: true,
			sharedBy: 'Matthew Hernandez',
			name: 'Mandy Moore',
			timeAgo: '3 days ago',
			tags: []
		}, {
			id: 3,
			status: 'active',
			isShared: false,
			name: 'Jones Marshall',
			timeAgo: '1 week ago',
			tags: [{
				color: "#493",
				name: "Housing First"
			}, {
				color: "#dd3",
				name: "Woman's Collective Interest Group"
			}, {
				color: "#f8f",
				name: "Monday Group"
			}]
		}, {
			id: 4,
			status: 'active',
			isShared: false,
			name: 'Sandy Garcia',
			timeAgo: '2 weeks ago',
			tags: []
		}]);

		this.get('contacts').pushObjects(this._buildMoreContacts());
		this.get('contacts').pushObjects(this._buildMoreContacts());
	},
});
