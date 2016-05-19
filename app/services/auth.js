import Ember from 'ember';
import config from '../config/environment';
import tz from 'npm:jstz';

const {
	notEmpty,
	alias,
	and
} = Ember.computed;

export default Ember.Service.extend({
	store: Ember.inject.service(),
	routing: Ember.inject.service('-routing'),

	hasToken: notEmpty('token'),
	hasAuthUser: notEmpty('authUser'),
	isLoggedIn: and('hasToken', 'hasAuthUser'),
	token: null,
	authUser: null,

	attemptedTransition: null,

	timezone: Ember.computed(function() {
		return tz.determine().name();
	}),

	// Methods
	// -------

	setupFromStorage: function() {
		return new Ember.RSVP.Promise((resolve, reject) => {
			const token = this._getItem('token'),
				userId = this._getItem('userId'),
				onFail = function() {
					this._doClear();
					reject();
				}.bind(this);

			console.log('auth manager setup from storage! userId: ' + userId);
			console.log(`token: ${token}`);

			if (token && userId) {
				// set token so application adapter can help make our request
				this.set('token', token);
				this.get('store').findRecord('staff', userId).then((staff) => {
					this._doStore(token, staff);
					resolve();
				}, onFail);
			} else {
				onFail();
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
				url: `${config.host}/login?timezone=${this.get('timezone')}`,
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
		this.get('store').unloadAll();
		this.get('routing').transitionTo('index');
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
	retryAttemptedTransition: function(fallback) {
		const transition = this.get('attemptedTransition');
		if (transition) {
			this.set('attemptedTransition', null);
			try {
				transition.retry();
			} catch (err) {
				fallback();
			}
		} else {
			fallback();
		}
	},

	// Helper methods
	// --------------

	_doStore: function(token, staff, storeCredentials = false) {

		console.log(`auth manager store for storeCredentials: ${storeCredentials}, staff: ${staff}`);
		this._setItem(storeCredentials, 'token', token);
		this._setItem(storeCredentials, 'userId', staff.get('id'));
		this.setProperties({
			token: token,
			authUser: staff
		});
	},
	_doClear: function() {

		console.log('auth manager clear');

		this._removeItem('token');
		this._removeItem('userId');
		this.setProperties({
			token: null,
			authUser: null
		});
	},

	// Storage
	// -------

	_setItem: function(persist, key, value) {
		try {
			(persist ? localStorage : sessionStorage).setItem(key, value);
		} catch (e) {
			Ember.debug('auth._setItem: web storage not available: ' + e);
		}
	},
	_removeItem: function(key) {
		localStorage.removeItem(key);
		sessionStorage.removeItem(key);
	},
	_getItem: function(key) {
		return localStorage.getItem(key) || sessionStorage.getItem(key);
	}
});
