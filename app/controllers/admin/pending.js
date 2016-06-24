import Ember from 'ember';

const {
	alias
} = Ember.computed;

export default Ember.Controller.extend({
	adminController: Ember.inject.controller('admin'),

	pendingStaff: alias('adminController.pending'),
	numPending: alias('adminController.numPending'),

	actions: {
		approve: function(staff) {
			staff.set('status', 'STAFF');
			if (staff.get('hasPhoneActionData')) {
				staff.set('phoneAction', 'number');
			}
			this._handlePending(staff);
		},
		reject: function(staff) {
			staff.set('phoneAction', null);
			staff.set('status', 'BLOCKED');
			this._handlePending(staff);
		},
		loadMore: function() {
			return new Ember.RSVP.Promise((resolve, reject) => {
				const query = Object.create(null),
					pending = this.get('pendingStaff');
				query.organizationId = this.get('stateManager.ownerAsOrg.id');
				query.status = ['pending'];
				if (pending.length) {
					query.offset = pending.length;
				}
				this.store.query('staff', query).then((success) => {
					pending.pushObjects(success.toArray());
					this.set('numPending', success.get('meta.total'));
					resolve();
				}, this.get('dataHandler').buildErrorHandler(reject));
			});
		},
	},

	_handlePending: function(staff) {
		this.get('dataHandler')
			.persist(staff)
			.then(() => {
				staff.set('pendingAction', null);
				const pending = this.get('pendingStaff').removeObject(staff);
				this.set('pendingStaff', Ember.copy(pending));
			});
	},
});
