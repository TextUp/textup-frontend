import Ember from 'ember';

export default Ember.Controller.extend({
	tags: [{
		id: 1,
		color: "#493",
		name: "Housing First",
		actions: []
	}, {
		id: 2,
		color: "#1BA5E0",
		name: "Rapid Rehousing",
		actions: []
	}, {
		id: 3,
		color: "#d3d3d3",
		name: "WO",
		actions: []
	}, {
		id: 4,
		color: "#dd3",
		name: "Woman's Collective Interest Group",
		actions: []
	}, {
		id: 5,
		color: "#f8f",
		name: "Monday Group",
		actions: []
	}],
	otherStaffs: [{
		name: 'Stamy Lee',
		id: 2,
	}, {
		name: 'Stanislaus Okinawa',
		id: 3,
	}, {
		name: 'Stanley Cutie-Candy Bai',
		id: 4,
	}],
	contacts: [{
		id: 1,
		actions: [],
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
		actions: [],
		status: 'active',
		isShared: true,
		sharedBy: 'Matthew Hernandez',
		name: 'Mandy Moore',
		timeAgo: '3 days ago',
		tags: []
	}, {
		id: 3,
		actions: [],
		status: 'active',
		isShared: false,
		name: 'Joe Schmo I am a very very long name so very very long',
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
		actions: [],
		status: 'active',
		isShared: false,
		name: 'Sandy Garcia',
		timeAgo: '2 weeks ago',
		tags: [],
		sharedWith: [{
			id: 3,
			permission: 'VIEW'
		}]
	}],
});
