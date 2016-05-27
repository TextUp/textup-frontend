import config from '../config/environment';
import DS from 'ember-data';
import Ember from 'ember';
import moment from 'moment';
import {
	clean as cleanNumber
} from '../utils/phone-number';

const {
	equal: eq,
	match,
	or
} = Ember.computed;

export default Ember.Service.extend({

	authManager: Ember.inject.service('auth'),
	dataHandler: Ember.inject.service('data'),
	routing: Ember.inject.service('-routing'),
	store: Ember.inject.service(),
	socket: Ember.inject.service(),

	// Events
	// ------

	init: function() {
		this._super(...arguments);
		this.get('authManager')
			.on(config.events.auth.success, this._bindSocketEvents.bind(this))
			.on(config.events.auth.clear, this._unbindSocketEvents.bind(this));
	},
	willDestroy: function() {
		this._super(...arguments);
		this.get('authManager')
			.off(config.events.auth.success)
			.off(config.events.auth.clear);
	},

	// Viewing
	// -------

	viewingContacts: match('routing.currentPath', /main.contacts/),
	viewingTag: match('routing.currentPath', /main.tag/),
	viewingMany: match('routing.currentPath', /many/),
	viewingPeople: match('routing.currentPath', /admin.people/),
	viewingTeam: match('routing.currentPath', /admin.team/),

	// Owner
	// -----

	// the current owner in the current application state
	// may be the logged-in user or a team that the user is on
	owner: null,
	ownerIsTeam: eq('owner.constructor.modelName', 'team'),
	ownerAsTeam: Ember.computed('owner', 'ownerIsTeam', function() {
		return this.get('ownerIsTeam') ? this.get('owner') : null;
	}),
	ownerIsOrg: eq('owner.constructor.modelName', 'organization'),
	ownerAsOrg: Ember.computed('owner', 'ownerIsOrg', function() {
		return this.get('ownerIsOrg') ? this.get('owner') : null;
	}),

	// Sharing staff
	// -------------

	relevantStaffs: null,
	staffsExceptMe: Ember.computed('relevantStaffs', function() {
		const user = this.get('authManager.authUser');
		return (this.get('relevantStaffs') || []).filter((staff) => {
			return staff.get('id') !== user.get('id');
		});
	}),
	teamMembers: Ember.computed('ownerIsTeam', 'staffsExceptMe', function() {
		return this.get('ownerIsTeam') ? this.get('staffsExceptMe') : [];
	}),
	shareCandidates: Ember.computed('ownerIsTeam', 'relevantStaffs', 'staffsExceptMe',
		function() {
			const candidates = this.get('ownerIsTeam') ? this.get('relevantStaffs') :
				this.get('staffsExceptMe');
			return candidates.filter((staff) => staff.get('phone'));
		}),

	// Numbers
	// -------

	_lastRetrievedNumbers: Ember.computed(() => new Date()),
	_cachedNumbers: null,
	numbers: Ember.computed({
		set: (key, value) => value,
		get: function() {
			return DS.PromiseArray.create({
				promise: this._getNumbers()
			});
		}
	}).volatile(),
	_getNumbers: function() {
		return new Ember.RSVP.Promise((resolve, reject) => {
			// if cache time is older than our grace period, then we
			// need to refresh our cache of available numbers
			const cacheTime = this.get('_lastRetrievedNumbers'),
				cacheGracePeriod = moment().subtract(1, 'minutes'),
				cacheExpired = cacheGracePeriod.isAfter(cacheTime),
				cachedNums = this._getUniqueCachedNums();
			if (!cachedNums || cachedNums.length < 5 || cacheExpired) {
				const auth = this.get('authManager');
				auth.authRequest({
					type: 'GET',
					url: `${config.host}/v1/numbers`
				}).then((numbers) => {
					numbers.forEach((num) => {
						num.phoneNumber = cleanNumber(num.phoneNumber);
					});
					this.set('_lastRetrievedNumbers', new Date());
					this.set('_cachedNumbers', numbers);
					resolve(numbers);
				}, this.get('dataHandler').buildErrorHandler(reject));
			} else {
				resolve(cachedNums);
			}
		});
	},
	_getUniqueCachedNums: function() {
		const nums = this.get('_cachedNumbers');
		if (!nums) {
			return nums;
		}
		const staffs = this.get('store').peekAll('staff'),
			teams = this.get('store').peekAll('team');
		return this._removeExisting(this._removeExisting(nums, staffs), teams);
	},
	_removeExisting: function(nums, models) {
		const numsMap = this._makeNumsMap(models);
		return nums.filter((num) => !numsMap[num.phoneNumber]);
	},
	_makeNumsMap: function(models) {
		const numsMap = Object.create(null),
			keys = ['newPhone.phoneNumber', 'phone'];
		models
			.filter((model) => keys.any((key) => Ember.isPresent(model.get(key))))
			.forEach((model) => {
				keys.forEach((key) => {
					const num = model.get(key);
					if (num) {
						numsMap[num] = true;
					}
				});
			});
		return numsMap;
	},

	// Socket handlers
	// ---------------

	_bindSocketEvents: function() {
		const socket = this.get('socket'),
			channelName = this.get('authManager.channelName');
		Ember.RSVP.all([
			socket.bind(channelName, 'records', this._handleSocketRecords.bind(this)),
			socket.bind(channelName, 'recordStatuses', this._handleSocketRecords.bind(this)),
			socket.bind(channelName, 'contacts', this._handleSocketContacts.bind(this))
		]).catch(this.get('dataHandler').buildErrorHandler());
	},
	_unbindSocketEvents: function() {
		this.get('socket').disconnect();
	},
	_handleSocketRecords: function(data) {
		const state = this.get('stateManager'),
			store = this.get('store');
		if (state.get('ownerHasPhone')) {
			const contacts = state.get('owner.contacts');
			(data.records || []).forEach((record) => {
				const record = store.push(store.normalize('record', record));
				contacts.unshift
			});

		}
	},
	_handleSocketContacts: function(data) {
		const state = this.get('stateManager');
		if (state.get('ownerHasPhone')) {
			const store = this.get('store'),
				contacts = state.get('owner.contacts');
			((data && data.contacts) || []).forEach((contact) => {
				const existing = store.hasRecordForId('contact', contact.id),
					model = store.push(store.normalize('contact', contact)),
					phone = this._getByPhoneId(contact.id); // actually, staff or team member with phone
				if (!existing && owner) {
					phone.
					contacts.unshift(model);
				}
			});
		}
	}
});
