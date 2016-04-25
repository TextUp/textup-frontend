import Ember from 'ember';

export default Ember.Controller.extend({
	peopleController: Ember.inject.controller('admin.people'),
	pendingStaff: [{
		name: 'Kiki Bai',
		username: 'kbai888',
		email: 'kbai888@textup.org',
		status: 'PENDING',
	}, {
		name: 'Cho Chang',
		username: 'domoarigato',
		email: 'domoarigato@textup.org',
		status: 'PENDING',
	}, {
		name: 'What Cheer',
		username: 'cheerful123',
		email: 'cheerful123@textup.org',
		status: 'PENDING',
	}, {
		name: 'Jack Kornfield',
		username: 'pathWithHeart',
		email: 'pathWithHeart@textup.org',
		status: 'PENDING',
	}],
	numPending: 20,
	selectedPending: Ember.computed.filterBy('pendingStaff', 'isSelected', true),

	actions: {
		selectAllShown: function() {
			this.get('pendingStaff').forEach((staff) => Ember.set(staff, 'isSelected', true));
		},
		selectNone: function() {
			this.get('pendingStaff').forEach((staff) => Ember.set(staff, 'isSelected', false));
		},
		loadMore: function() {
			this.get('pendingStaff').pushObjects(this.get('peopleController').loadMore());
			return new Ember.RSVP.Promise(function(resolve, reject) {
				Ember.run.later(this, resolve, 2000);
			});
		},
	}
});
