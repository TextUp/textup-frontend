import config from '../config/environment';
import Ember from 'ember';
import tz from 'npm:jstz';

const {
	notEmpty,
	and
} = Ember.computed;

export default Ember.Service.extend({
	store: Ember.inject.service(),
	routing: Ember.inject.service('-routing'),
	storage: Ember.inject.service(),
	socket: Ember.inject.service(),

	hasToken: notEmpty('token'),
	hasAuthUser: notEmpty('authUser'),
	isLoggedIn: and('hasToken', 'hasAuthUser'),
	token: null,
	authUser: null,

	attemptedTransition: null,

	timezone: Ember.computed(function() {
		return tz.determine().name();
	}),

	// Events
	// ------

	willDestroy: function() {
		this.get('storage').off('updated', this);
	},

	// Methods
	// -------

	setupFromStorage: function() {


		this.get('socket').configure();


		return this.get('storage').sync().then(this._doSetup.bind(this));
	},
	validate: function(username, password) {
		return new Ember.RSVP.Promise((resolve, reject) => {
			if (!username || !password) {
				return reject();
			}
			this._sendCredentials(username, password).then(resolve, reject);
		});
	},
	login: function(username, password, storeCredentials = false) {
		return new Ember.RSVP.Promise((resolve, reject) => {
			if (!username || !password) {
				return reject();
			}
			this._sendCredentials(username, password).then((data) => {
				this.get('storage').set('persist', storeCredentials);
				const store = this.get('store'),
					staff = store.push(store.normalize('staff', data.staff));
				this._doStore(data.access_token, staff);
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

	// Utility methods
	// ---------------

	authRequest: function(options = {}) {
		return Ember.$.ajax(Ember.merge({
			contentType: 'application/json',
			beforeSend: (request) => {
				if (this.get('hasToken')) {
					request.setRequestHeader("Authorization",
						`Bearer ${this.get('token')}`);
				}
			}
		}, options));
	},

	// Helper methods
	// --------------

	_handleStorageChange: function() {
		const storage = this.get('storage');
		if (storage.getItem('token') === this.get('token')) {
			return;
		}
		const cachedIsLoggedIn = this.get('isLoggedIn');
		if (storage.getItem('token')) {
			this._doSetup().then(() => {
				if (!cachedIsLoggedIn) {
					this.get('routing')
						.transitionTo('main', [this.get('authUser')]);
				}
			}, this.logout.bind(this));
		} else {
			this.logout();
		}
	},
	_sendCredentials: function(username, password) {
		return Ember.$.ajax({
			type: 'POST',
			url: `${config.host}/login?timezone=${this.get('timezone')}`,
			contentType: 'application/json',
			data: JSON.stringify({
				username: username,
				password: password
			})
		});
	},
	_doSetup: function() {
		return new Ember.RSVP.Promise((resolve, reject) => {
			const storage = this.get('storage'),
				token = storage.getItem('token'),
				userId = storage.getItem('userId'),
				onFail = function() {
					this._doClear();
					reject();
				}.bind(this);
			if (token && userId) {
				// set token so application adapter can help make our request
				this.set('token', token);
				this.get('store').findRecord('staff', userId).then((staff) => {
					this._doStore(token, staff);
					storage.on('updated', this, function() {
						this._handleStorageChange();
					}.bind(this));
					resolve();
				}, onFail);
			} else {
				onFail();
			}
		});
	},
	_doStore: function(token, staff) {
		const storage = this.get('storage');
		storage.setItem('token', token);
		storage.setItem('userId', staff.get('id'));
		storage.sendStorage();
		this.setProperties({
			token: token,
			authUser: staff
		});
	},
	_doClear: function() {
		const storage = this.get('storage');
		storage.removeItem('token');
		storage.removeItem('userId');
		storage.sendStorage();
		this.setProperties({
			token: null,
			authUser: null
		});
	},
});
