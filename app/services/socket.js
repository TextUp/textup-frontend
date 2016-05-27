import Ember from 'ember';
import Pusher from 'npm:pusher-js';
import config from '../config/environment';

export default Ember.Service.extend({

	_socket: null,

	// Events
	// ------

	willDestroy: function() {
		this._super(...arguments);
		this.disconnect();
	},

	// Socket
	// ------

	connect: function(options = undefined) {
		return this._getOrCreateSocket(options);
	},
	disconnect: function() {
		const socket = this.get('_socket');
		if (socket) {
			this.unbind();
			socket.disconnect();
		}
	},

	// Channel events
	// --------------

	bind: function(channelName, eventName, handler, options = undefined) {
		return new Ember.RSVP.Promise((resolve, reject) => {
			const socket = this._getOrCreateSocket(options);
			this._getOrCreateChannel(socket, channelName).then((channel) => {
				channel.bind(eventName, handler);
				resolve();
			}, reject);
		});
	},
	unbind: function() {
		const socket = this.get('_socket'),
			[channelName, eventName] = arguments;
		if (!socket) {
			return;
		}
		if (arguments.length === 0) { // unbind all events on all channels
			Ember.A(socket.allChannels()).forEach((ch) => ch.unbind());
		} else {
			const channel = socket.channel(channelName);
			if (!channel) {
				return;
			}
			if (arguments.length === 1) { // unbind all events on a channel
				channel.unbind();
			} else { // unbind specific event on a channel
				channel.unbind(eventName);
			}
		}
		return this; // for fluent syntax
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
				const channel = socket.subscribe(channelName);
				channel.bind('pusher:subscription_error', reject)
					.bind('pusher:subscription_succeeded', resolve.bind(this, channel));
			}
		});
	}
});
