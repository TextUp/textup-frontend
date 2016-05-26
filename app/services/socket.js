import Ember from 'ember';
import Pusher from 'npm:pusher-js';
import config from '../config/environment';

export default Ember.Service.extend({

	_socket: null,

	// Channels
	// -------

	subscribe: function(channelName, options = undefined) {
		return new Ember.RSVP.Promise((resolve, reject) => {
			const socket = this._getOrCreateSocket(options),
				existing = socket.channel(channelName);
			if (existing) {
				resolve();
			} else {
				socket.subscribe(channelName)
					.bind('pusher:subscription_succeeded', resolve)
					.bind('pusher:subscription_error', reject);
			}
		});
	},
	unsubscribe: function(channelName) {
		const socket = this.get('_socket');
		if (socket) {
			socket.unsubscribe(channelName);
		}
	},

	// Channel events
	// --------------

	bind: function(channelName, event, handler, options = undefined) {
		return new Ember.RSVP.Promise((resolve, reject) => {
			const socket = this._getOrCreateSocket(options);
			this._getOrCreateChannel(socket, channelName).then((channel) => {
				channel
			}, reject);
		});
	},
	unbind: function(channel, event) {
		if (arguments.length === 0) {

		} else if (arguments.length === 1) {

		} else { // take first two arguments

		}
	},

	// Helpers
	// -------

	_getOrCreateSocket: function(options = undefined) {
		const existing = this.get('_socket');
		if (options) {
			if (existing) {
				existing.disconnect();
			}
			const socket = new Pusher(config.socket.authKey, options || Object.create(null));
			this.set('socket', socket);
			return socket;
		} else {
			return existing;
		}
	},
	_getOrCreateChannel: function(socket, channelName) {
		return new Ember.RSVP.Promise((resolve, reject) => {
			const existing = socket.channel(channelName);
			if (existing) {
				resolve();
			} else {
				const channel = socket.subscribe(channelName)
				channel.bind('pusher:subscription_error', reject)
					.bind('pusher:subscription_succeeded', resolve.bind(this, channel));
			}
		});
	}
});
