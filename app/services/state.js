import config from '../config/environment';
import DS from 'ember-data';
import Ember from 'ember';
import moment from 'moment';
import Inflector from 'ember-inflector';
import { clean as cleanNumber } from '../utils/phone-number';

const { equal: eq, match } = Ember.computed;

export default Ember.Service.extend({
  authManager: Ember.inject.service('auth'),
  dataHandler: Ember.inject.service('data'),
  routing: Ember.inject.service('-routing'),
  store: Ember.inject.service(),
  socket: Ember.inject.service(),
  storage: Ember.inject.service(),

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

  // Actions
  // -------

  actions: {
    doNumbersSearch(search = '') {
      return new Ember.RSVP.Promise((resolve, reject) => {
        const auth = this.get('authManager');
        auth
          .authRequest({
            type: 'GET',
            url: `${config.host}/v1/numbers?search=${search}`
          })
          .then(({ numbers = [] }) => {
            numbers.forEach(num => {
              num.phoneNumber = cleanNumber(num.phoneNumber);
            });
            resolve(numbers);
          }, this.get('dataHandler').buildErrorHandler(reject));
      });
    }
  },

  // Routing
  // -------

  viewingContacts: match('routing.currentPath', /main.contacts/),
  viewingTag: match('routing.currentPath', /main.tag/),
  viewingSearch: match('routing.currentPath', /main.search/),
  viewingMany: match('routing.currentPath', /many/),
  viewingPeople: match('routing.currentPath', /admin.people/),
  viewingTeam: match('routing.currentPath', /admin.team/),

  currentRoute: Ember.computed('routing.currentRouteName', function() {
    const routeName = this.get('routing.currentRouteName');
    return routeName ? Ember.getOwner(this).lookup(`route:${routeName}`) : null;
  }),
  trackLocation: Ember.observer('routing.router.url', function() {
    Ember.run.next(this, function() {
      this.get('storage').trySet(localStorage, 'currentUrl', this.get('routing.router.url'));
    });
  }),

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

  // Setup
  // -----

  skippedSetupKey: Ember.computed('authManager.authUser.id', function() {
    const id = this.get('authManager.authUser.id');
    return `${id}-skippedSetup`;
  }),
  hasSkippedSetup: Ember.computed('skippedSetupKey', function() {
    const storage = this.get('storage');
    return storage.isItemPersistent(this.get('skippedSetupKey'));
  }).volatile(),
  skipSetup: function() {
    const storage = this.get('storage');
    storage.trySet(localStorage, this.get('skippedSetupKey'), 'yes');
  },

  // Availability
  // ------------

  isPhoneAvailable: Ember.computed(
    'staffsExceptMe.[]',
    'ownerIsTeam',
    'authManager.authUser.schedule.content.isAvailableNow',
    'authManager.authUser.manualSchedule',
    'authManager.authUser.isAvailable',
    function() {
      const staffs = [this.get('authManager.authUser')];
      if (this.get('ownerIsTeam')) {
        staffs.pushObjects(this.get('staffsExceptMe'));
      }
      return staffs.any(st => st.get('isAvailableNow'));
    }
  ),

  // Sharing staff
  // -------------

  relevantStaffs: null,
  staffsExceptMe: Ember.computed('relevantStaffs', function() {
    const user = this.get('authManager.authUser');
    return (this.get('relevantStaffs') || []).filter(staff => {
      return staff.get('id') !== user.get('id');
    });
  }),
  teamMembers: Ember.computed('ownerIsTeam', 'staffsExceptMe', function() {
    return this.get('ownerIsTeam') ? this.get('staffsExceptMe') : [];
  }),
  shareCandidates: Ember.computed('ownerIsTeam', 'relevantStaffs', 'staffsExceptMe', function() {
    const candidates = this.get('ownerIsTeam')
      ? this.get('relevantStaffs')
      : this.get('staffsExceptMe');
    return DS.PromiseArray.create({
      promise: Ember.RSVP.all(candidates.mapBy('phone')).then(phones => {
        const staffsWithPhones = [];
        phones.forEach((phone, index) => {
          if (Ember.isPresent(phone)) {
            staffsWithPhones.pushObject(candidates.objectAt(index));
          }
        });
        return staffsWithPhones;
      })
    });
  }),

  // Socket handlers
  // ---------------

  _bindSocketEvents: function() {
    const socket = this.get('socket'),
      channelName = this.get('authManager.channelName');
    socket.connect({
      encrypted: true,
      authEndpoint: `${config.host}/v1/sockets`,
      auth: {
        headers: {
          Authorization: `Bearer ${this.get('authManager.token')}`
        }
      }
    });
    Ember.RSVP
      .all([
        socket.bind(channelName, 'records', this._handleSocketRecords.bind(this)),
        socket.bind(channelName, 'recordStatuses', this._handleSocketRecords.bind(this)),
        socket.bind(channelName, 'contacts', this._handleSocketContacts.bind(this)),
        socket.bind(channelName, 'futureMessages', this._handleSocketFutureMsgs.bind(this))
      ])
      .catch(this.get('dataHandler').buildErrorHandler());
  },
  _unbindSocketEvents: function() {
    this.get('socket').disconnect();
  },

  _handleSocketFutureMsgs: function(data) {
    this._addNewForComputedArray('future-message', data);
  },
  _handleSocketRecords: function(data) {
    this._addNewForComputedArray('record', data);
  },
  _handleSocketContacts: function(data) {
    if (!Ember.isArray(data)) {
      return;
    }
    // Prevent updating of the contact that we are currently viewing
    const rte = this.get('currentRoute');
    if (
      rte &&
      (rte.get('routeName') === 'main.contacts.contact' ||
        rte.get('routeName') === 'main.tag.contact')
    ) {
      const contactId = String(rte.get('currentModel.id'));
      data.removeObject(data.find(item => String(item.id) === contactId));
    }
    this._addNewForManualArray('phone', 'contact', data);
  },
  _addNewForComputedArray: function(modelName, data) {
    if (!Ember.isArray(data)) {
      return;
    }
    const store = this.get('store');
    data.forEach(item => store.push(store.normalize(modelName, item)));
  },
  _addNewForManualArray: function(ownerName, itemName, data) {
    if (!data) {
      return;
    }
    const store = this.get('store');
    data.forEach(item => {
      const existingBefore = store.hasRecordForId(itemName, item.id),
        model = store.push(store.normalize(itemName, item)),
        owner = store.peekRecord(ownerName, item[ownerName]);
      if (!existingBefore && owner) {
        const array = owner.get(Inflector.inflector.pluralize(itemName));
        if (Ember.isArray(array)) {
          array.unshiftObject(model);
        }
      }
    });
  }
});
