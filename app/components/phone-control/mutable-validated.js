import Ember from 'ember';
import callIfPresent from '../../utils/call-if-present';
import config from '../../config/environment';
import {
	format
} from '../../utils/phone-number';

export default Ember.Component.extend({
	onChange: null,
	onClick: null,
	onValidate: null,
	onValidateStart: null,
	onValidateSuccess: null,

	// Injected services
	// -----------------

	authManager: Ember.inject.service('auth'),
	dataHandler: Ember.inject.service('data'),
	notifications: Ember.inject.service(),

	// Computed Properties
	// -------------------

	_newNumber: '',

	actions: {
		updateNew: function(num) {
			this.set('_newNumber', num);
			callIfPresent(this.get('onChange'), num);
		},
		verifyNew: function(num) {
			callIfPresent(this.get('onClick'), num);
			callIfPresent(this.get('onValidateStart'), num);
			this.get('authManager').authRequest({
				type: 'POST',
				url: `${config.host}/v1/numbers`,
				data: JSON.stringify({
					phoneNumber: num
				})
			}).then(() => {
				this.set('_newNumber', num);
				this.get('notifications')
					.info(`Sent verification text to ${format(num)}`);
			}, this.get('dataHandler').buildErrorHandler());
		},
		completeVerify: function(validationCode, num) {
			return new Ember.RSVP.Promise((resolve, reject) => {
				callIfPresent(this.get('onValidate'), num);
				this.get('authManager').authRequest({
					type: 'POST',
					url: `${config.host}/v1/numbers`,
					data: JSON.stringify({
						phoneNumber: num,
						token: validationCode
					})
				}).then(() => {
					this.set('number', num);
					this.set('_newNumber', num);
					this.get('notifications')
						.success(`Successfully validated ${format(num)}`);
					callIfPresent(this.get('onValidateSuccess'), num);
					resolve();
				}, (failure) => {
					if (this.get('dataHandler').displayErrors(failure) === 0) {
						this.get('notifications')
							.error(`Invalid or expired token for ${format(num)}`);
					}
					reject();
				});
			});
		},
	}
});
