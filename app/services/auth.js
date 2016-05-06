import Ember from 'ember';
import config from '../config/environment';

const {
	notEmpty,
	alias,
	and
} = Ember.computed;

export default Ember.Service.extend({

	store: Ember.inject.service(),
	hasToken: notEmpty('token'),
	hasAuthUser: notEmpty('authUser'),
	isLoggedIn: and('hasToken', 'hasAuthUser'),
	token: null,
	authUser: null,

	// Methods
	// -------

	setupFromStorage: function() {
		return new Ember.RSVP.Promise((resolve, reject) => {
			const token = localStorage.getItem('token'),
				userId = localStorage.getItem('userId');

			console.log('auth manager setup from storage! userId: ' + userId);
			console.log(`token: ${token}`);

			if (token && userId) {
				// set token so application adapter can help make our request
				this.set('token', token);
				this.get('store').findRecord('staff', userId).then((staff) => {
					this._doStore(token, staff);
					resolve();
				}, () => {
					this._doClear();
					reject();
				});
			} else {
				this._doClear();
				reject();
			}
		});
	},
	validate: alias('login'),
	login: function(username, password, storeCredentials = false) {
		console.log(`auth manager LOGIN with storeCredentials: ${storeCredentials}, username: ${username}, password: ${password}`);

		return new Ember.RSVP.Promise((resolve, reject) => {
			if (!username || !password) {
				return reject();
			}
			Ember.$.ajax({
				type: 'POST',
				url: `${config.host}/login`,
				contentType: 'application/json',
				data: JSON.stringify({
					username: username,
					password: password
				})
			}).then((data) => {
				const store = this.get('store'),
					staff = store.push(store.normalize('staff', data.staff));
				this._doStore(data.access_token, staff, storeCredentials);
				resolve(data);
			}, reject);
		});
	},
	logout: function() {
		this._doClear();
	},
	resetPassword: function(username) {
		return new Ember.RSVP.Promise((resolve, reject) => {
			if (!username) {
				return reject();
			}
			Ember.$.ajax({
				type: 'POST',
				url: `${config.host}/reset`,
				contentType: 'application/json',
				data: JSON.stringify({
					username: username
				})
			}).then(resolve, reject);
		});
	},

	// Helper methods
	// --------------

	_doStore: function(token, staff, storeCredentials = false) {

		console.log(`auth manager store for storeCredentials: ${storeCredentials}, staff: ${staff}`);
		if (storeCredentials) {
			localStorage.setItem('token', token);
			localStorage.setItem('userId', staff.get('id'));
		}
		this.setProperties({
			token: token,
			authUser: staff
		});
	},
	_doClear: function() {

		console.log('auth manager clear');

		localStorage.removeItem('token');
		localStorage.removeItem('userId');
		this.setProperties({
			token: null,
			authUser: null
		});
	},
});
