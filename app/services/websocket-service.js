import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import Pusher from 'npm:pusher-js';

const { assign, isPresent, RSVP } = Ember;

export const PUSHER_EVENT_FAIL = 'pusher:subscription_error';
export const PUSHER_EVENT_SUCCESS = 'pusher:subscription_succeeded';

export default Ember.Service.extend({
  willDestroy() {
    this._super(...arguments);
    this.disconnect();
  },

  // Methods
  // -------

  connect(options = null) {
    return this._createConnection(options);
  },
  bind(channelName, eventName, handler) {
    return new RSVP.Promise((resolve, reject) => {
      const connection = this.get('_connection');
      if (isPresent(connection)) {
        this._getOrCreateChannel(connection, channelName).then(channel => {
          channel.bind(eventName, handler);
          resolve();
        }, reject);
      } else {
        reject();
      }
    });
  },
  disconnect() {
    const connection = this.get('_connection');
    if (connection) {
      connection.disconnect();
      this.set('_connection', null);
    }
  },

  // Internal
  // --------

  _connection: null,

  _createConnection(options) {
    const newConnection = new Pusher(config.socket.authKey, assign({}, options)),
      existing = this.get('_connection');
    if (existing) {
      existing.disconnect();
    }
    this.set('_connection', newConnection);
    return newConnection;
  },
  _getOrCreateChannel(connection, channelName) {
    return new RSVP.Promise((resolve, reject) => {
      const existing = connection.channel(channelName);
      if (existing) {
        resolve(existing);
      } else {
        const channel = connection.subscribe(channelName);
        channel
          .bind(PUSHER_EVENT_FAIL, reject)
          .bind(PUSHER_EVENT_SUCCESS, resolve.bind(this, channel));
      }
    });
  },
});
