import Ember from 'ember';
import config from '../../config/environment';

export default Ember.Route.extend({
	setupController: function(controller) {
		const selected = this.controllerFor('signup').get('selected');
		if (!selected) {
			this.transitionTo('signup.index');
		}
		controller.set('selected', selected);
		controller.set('staff', this.store.createRecord('staff'));
	},
	deactivate: function() {
		this.controller.get('staff').rollbackAttributes();
		this.controller.set('confirmPassword', null);
	},

	actions: {
		createStaff: function(data) {
			const {
				name,
				username,
				email,
				password,
				lockCode
			} = data.toJSON(),
				org = this.controller.get('selected'),
				onFail = (failure) => {
					if (this.get('dataHandler').displayErrors(failure) === 0) {
						this.notifications.error(`Could not create new account.
							Please try again later.`);
					}
				},
				toBeSaved = {
					staff: {
						name: name,
						username: username,
						password: password,
						email: email,
						lockCode: lockCode
					}
				};
			// build org based on if new or existing
			toBeSaved.staff.org = org.get('isNew') ? {
				name: org.get('name'),
				location: org.get('location.content').toJSON()
			} : {
				id: org.get('id')
			};
			// make the request
			Ember.$.ajax({
				type: 'POST',
				url: `${config.host}/v1/public/staff`,
				contentType: 'application/json',
				data: JSON.stringify(toBeSaved)
			}).then((result) => {
				this.notifications
					.success(`Almost done creating your account...`);
				const staff = this.store.push(
					this.store.normalize('staff', result.staff));
				this.get('authManager')
					.login(staff.get('username'), password)
					.then(() => {
						this.notifications
							.success(`Success! Welcome ${staff.get('name')}!`);
						this.transitionTo('none');
					}, onFail);
			}, onFail);
		},
	}
});
