import Constants from 'textup-frontend/constants';
import config from 'textup-frontend/config/environment';
import Ember from 'ember';

// [NOTE] We start watching for auth changes in an instance initializer

const { isArray } = Ember;

export const EVENT_CONTACTS = 'contacts';
export const EVENT_FUTURE_MESSAGES = 'futureMessages';
export const EVENT_RECORD_ITEMS = 'recordItems';
export const EVENT_PHONES = 'phones';
export const STORE_REQUEST_TYPE = 'query';

export default Ember.Service.extend({
  authService: Ember.inject.service(),
  store: Ember.inject.service(),
  websocketService: Ember.inject.service(),

  willDestroy() {
    this._super(...arguments);
    this.get('authService')
      .off(config.events.auth.success, this)
      .off(config.events.auth.clear, this);
  },

  // Methods
  // -------

  startWatchingAuthChanges() {
    this.get('authService')
      .on(config.events.auth.success, this._bindSocketEvents.bind(this))
      .on(config.events.auth.clear, this._unbindSocketEvents.bind(this));
  },

  // Internal
  // --------

  _bindSocketEvents() {
    const websocketService = this.get('websocketService'),
      channelName = this.get('authService.authUser.channelName');
    websocketService.connect({
      encrypted: true,
      authEndpoint: `${config.host}/v1/sockets`,
      auth: {
        headers: { [Constants.REQUEST_HEADER.AUTH]: this.get('authService.authHeader') },
      },
    });
    websocketService.bind(channelName, EVENT_RECORD_ITEMS, this._handleRecordItems.bind(this));
    websocketService.bind(channelName, EVENT_CONTACTS, this._handleContacts.bind(this));
    websocketService.bind(channelName, EVENT_FUTURE_MESSAGES, this._handleFutureMsgs.bind(this));
    websocketService.bind(channelName, EVENT_PHONES, this._handlePhones.bind(this));
  },
  _unbindSocketEvents() {
    this.get('websocketService').disconnect();
  },

  _handlePhones(data) {
    this._normalizeAndPushSocketPayload(Constants.MODEL.PHONE, data);
  },
  _handleFutureMsgs(data) {
    this._normalizeAndPushSocketPayload(Constants.MODEL.FUTURE_MESSAGE, data);
  },
  _handleRecordItems(data) {
    this._normalizeAndPushSocketPayload(Constants.MODEL.RECORD_ITEM, data);
  },
  _handleContacts(data) {
    this._normalizeAndPushSocketPayload(Constants.MODEL.CONTACT, data);
  },
  _normalizeAndPushSocketPayload(modelName, data) {
    if (!isArray(data)) {
      return;
    }
    const store = this.get('store'),
      serializer = store.serializerFor(modelName),
      modelClass = store.modelFor(modelName),
      // use `normalizeResponse` method of serializer to enable handling of polymorphic classes
      // These polymorphic hooks are not called when using the `store.normalize` method
      normalized = serializer.normalizeResponse(
        store,
        modelClass,
        { [modelName]: data },
        null,
        STORE_REQUEST_TYPE
      );
    store.push(normalized);
  },
});
