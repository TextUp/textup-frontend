import config from 'textup-frontend/config/environment';
import DS from 'ember-data';
import Ember from 'ember';
import { clean as cleanNumber } from 'textup-frontend/utils/phone-number';

const { computed } = Ember;

export default Ember.Service.extend({
  authService: Ember.inject.service(),
  dataService: Ember.inject.service(),
  router: Ember.inject.service(),
  store: Ember.inject.service(),
  socket: Ember.inject.service(),
  storage: Ember.inject.service(),

  // Events
  // ------

  init() {
    this._super(...arguments);
    this.get('authService')
      .on(config.events.auth.success, this._bindSocketEvents.bind(this))
      .on(config.events.auth.clear, this._unbindSocketEvents.bind(this));
  },
  willDestroy() {
    this._super(...arguments);
    this.get('authService')
      .off(config.events.auth.success)
      .off(config.events.auth.clear);
  },

  // Actions
  // -------

  actions: {
    doNumbersSearch(search = '') {
      return new Ember.RSVP.Promise((resolve, reject) => {
        const auth = this.get('authService');
        auth
          .authRequest({
            type: 'GET',
            url: `${config.host}/v1/numbers?search=${search}`,
          })
          .then(({ numbers = [] }) => {
            numbers.forEach(num => {
              num.phoneNumber = cleanNumber(num.phoneNumber);
            });
            resolve(numbers);
          }, this.get('dataService').buildErrorHandler(reject));
      });
    },
  },

  // Routing
  // -------

  viewingContacts: computed.match('router.currentRouteName', /main.contacts/),
  viewingTag: computed.match('router.currentRouteName', /main.tag/),
  viewingSearch: computed.match('router.currentRouteName', /main.search/),
  viewingMany: computed.match('router.currentRouteName', /many/),
  viewingPeople: computed.match('router.currentRouteName', /admin.people/),
  viewingTeam: computed.match('router.currentRouteName', /admin.team/),

  currentRoute: computed('router.currentRouteName', function() {
    const routeName = this.get('router.currentRouteName');
    return routeName ? Ember.getOwner(this).lookup(`route:${routeName}`) : null;
  }),
  trackLocation: Ember.observer('router.currentURL', function() {
    Ember.run.next(this, function() {
      this.get('storage').trySet(localStorage, 'currentUrl', this.get('router.currentURL'));
    });
  }),

  // Owner
  // -----

  // the current owner in the current application state
  // may be the logged-in user or a team that the user is on
  owner: null,
  ownerIsTeam: computed('owner', function() {
    return TypeUtils.isTeam(this.get("owner"));
  })
  ownerAsTeam: computed('owner', 'ownerIsTeam', function() {
    return this.get('ownerIsTeam') ? this.get('owner') : null;
  }),
  ownerIsOrg: computed('owner', function() {
    return TypeUtils.isOrg(this.get("owner"));
  })
  ownerAsOrg: computed('owner', 'ownerIsOrg', function() {
    return this.get('ownerIsOrg') ? this.get('owner') : null;
  }),

  // Setup
  // -----

  skippedSetupKey: computed('authService.authUser.id', function() {
    const id = this.get('authService.authUser.id');
    return `${id}-skippedSetup`;
  }),
  hasSkippedSetup: computed('skippedSetupKey', function() {
    const storage = this.get('storage');
    return storage.isItemPersistent(this.get('skippedSetupKey'));
  }).volatile(),
  skipSetup() {
    const storage = this.get('storage');
    storage.trySet(localStorage, this.get('skippedSetupKey'), 'yes');
  },

  // Sharing staff
  // -------------

  relevantStaffs: null,
  staffsExceptMe: computed('relevantStaffs', function() {
    const user = this.get('authService.authUser');
    return (this.get('relevantStaffs') || []).filter(staff => {
      return staff.get('id') !== user.get('id');
    });
  }),
  teamMembers: computed('ownerIsTeam', 'staffsExceptMe', function() {
    return this.get('ownerIsTeam') ? this.get('staffsExceptMe') : [];
  }),
  shareCandidates: computed('ownerIsTeam', 'relevantStaffs', 'staffsExceptMe', function() {
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
      }),
    });
  }),

  // Socket handlers
  // ---------------

  _bindSocketEvents() {
    const socket = this.get('socket'),
      channelName = this.get('authService.authUser.channelName');
    socket.connect({
      encrypted: true,
      authEndpoint: `${config.host}/v1/sockets`,
      auth: {
        headers: {
          Authorization: `Bearer ${this.get('authService.token')}`,
        },
      },
    });
    Ember.RSVP.all([
      socket.bind(channelName, 'records', this._handleSocketRecords.bind(this)),
      socket.bind(channelName, 'contacts', this._handleSocketContacts.bind(this)),
      socket.bind(channelName, 'futureMessages', this._handleSocketFutureMsgs.bind(this)),
      socket.bind(channelName, 'phones', this._handleSocketPhones.bind(this)),
    ]).catch(this.get('dataService').buildErrorHandler());
  },
  _unbindSocketEvents() {
    this.get('socket').disconnect();
  },

  _handleSocketPhones(data) {
    this._normalizeAndPushSocketPayload('phone', data);
  },
  _handleSocketFutureMsgs(data) {
    this._normalizeAndPushSocketPayload('future-message', data);
  },
  _handleSocketRecords(data) {
    this._normalizeAndPushSocketPayload('record-item', data);
  },
  _handleSocketContacts(data) {
    this._normalizeAndPushSocketPayload('contact', data);
  },
  _normalizeAndPushSocketPayload(modelName, data) {
    if (!Ember.isArray(data)) {
      return;
    }
    const store = this.get('store'),
      serializer = store.serializerFor(modelName),
      modelClass = store.modelFor(modelName),
      // user the normalizeResponse method of serializer to enable handling of polymorphic classes
      // These polymorphic hooks are not called when using the `store.normalize` method
      normalized = serializer.normalizeResponse(
        store,
        modelClass,
        { [modelName]: data },
        null,
        'query'
      );
    store.push(normalized);
  },
});
