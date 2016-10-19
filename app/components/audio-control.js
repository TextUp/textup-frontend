import Ember from 'ember';
import defaultIfAbsent from '../utils/default-if-absent';
import moment from 'moment';

export default Ember.Component.extend({

	source: defaultIfAbsent(''),
	volume: defaultIfAbsent(75),
	disabled: defaultIfAbsent(false),
	seekIncrement: defaultIfAbsent(10),
	volumeIncrement: defaultIfAbsent(10),

	classNames: 'audio-control',

	_audio: null,
	_isMuted: false,
	_isPlaying: false,
	_isLoading: false,
	_hasError: false,
	_durationDisplay: null,
	_currentTimeDisplay: null,
	_percentBuffered: '0%',
	_percentComplete: '0%',

	// Computed properties
	// -------------------

	publicAPI: Ember.computed('hasSource', '_hasError', '_isMuted',
		'_isPlaying', '_isLoading', '_volume',
		function() {
			return {
				hasSource: this.get('hasSource'),
				hasError: this.get('_hasError'),
				isMuted: this.get('_isMuted'),
				isPlaying: this.get('_isPlaying'),
				isLoading: this.get('_isLoading'),
				_volume: this.get('_volume'),
				actions: {
					play: this.play.bind(this),
					pause: this.pause.bind(this)
				}
			};
		}),
	hasSource: Ember.computed.notEmpty('source'),
	_volume: Ember.computed('volume', '_isMuted', {
		get: function() {
			const volume = parseInt(this.get('volume'));
			if (this.get('_isMuted')) {
				return 0;
			}
			return !isNaN(volume) ? this.normalizeVolume(volume) : 50;
		},
		set: function(key, value) {
			this.setVolume(this.get('_audio'), value);
			this.setProperties({
				volume: value,
				_isMuted: false
			});
			return value;
		}
	}),
	_volumePercentage: Ember.computed('_volume', function() {
		return this.get('_volume') + '%';
	}),

	// Events
	// ------

	didInsertElement: function() {
		Ember.run.scheduleOnce('afterRender', this, function() {
			const audio = new Audio(this.get('source'));

			this.set('_audio', audio);

			audio.onloadedmetadata = this.setup.bind(this, audio);
			audio.onended = this.reset.bind(this, audio);

			audio.ondurationchange = this.updateDuration.bind(this, audio);
			audio.ontimeupdate = this.updateTimeAndPercent.bind(this, audio);

			audio.onprogress = this.updateBuffered.bind(this, audio);
			audio.oncanplaythrough = this.updateBuffered.bind(this, audio);

			audio.onplaying = function() {
				this.set('_isLoading', false);
			}.bind(this);
			audio.onwaiting = function() {
				this.set('_isLoading', true);
			}.bind(this);

			audio.onerror = function() {
				this.set('_hasError', true);
			}.bind(this);
		});
	},
	willDestroyElement: function() {
		this.pause();
		this.$().off(`.${this.elementId}`);
	},
	keyUp: function(event) {
		const audio = this.get('_audio');
		if (!Ember.isPresent(audio)) {
			return;
		}
		const seekInc = this.get('seekIncrement'),
			volInc = this.get('volumeIncrement'),
			duration = audio.duration,
			currentTime = audio.currentTime,
			volume = this.get('volume');
		if (event.which === 13) { // enter
			if (audio.paused) {
				this.play();
			} else {
				this.pause();
			}
		} else if (event.which === 39) { // right arrow => jump forward
			audio.currentTime = Math.min(duration, currentTime + seekInc);
		} else if (event.which === 37) { // left arrow => jump back
			audio.currentTime = Math.max(0, currentTime - seekInc);
		} else if (event.which === 38) { // up arrow => volume up
			this.set('_volume', this.normalizeVolume(volume + volInc));
		} else if (event.which === 40) { // down arrow => volume down
			this.set('_volume', this.normalizeVolume(volume - volInc));
		}
	},

	// Actions
	// -------

	actions: {
		play: function() {
			this.play();
			return false;
		},
		pause: function() {
			this.pause();
			return false;
		},
		toggleVolume: function() {
			this.toggleProperty('_isMuted');
			this.setVolume(this.get('_audio'), 0);
			return false;
		},
	},

	// Audio event handlers
	// --------------------

	setup: function(audio) {
		if (this.isDestroying || this.isDestroyed) {
			return;
		}
		// so that setup is only called once
		audio.onloadedmetadata = null;
		this.updateDuration(audio);
		this.updateTimeAndPercent(audio);
		this.setVolume(audio, this.get('_volume'));

		const adjustTimeSlider = this.adjustTimeSlider.bind(this, audio),
			adjustVolumeSlider = this.adjustVolumeSlider.bind(this),
			delay = 100;
		this._bindSliderHandlers('.audio-progress-bar', adjustTimeSlider, delay);
		this._bindSliderHandlers('.volume-bar', adjustVolumeSlider, delay);
	},
	reset: function(audio) {
		if (this.isDestroying || this.isDestroyed) {
			return;
		}
		audio.currentTime = 0;
		this.updateTimeAndPercent(audio);
		this.set('_isPlaying', false);
	},
	updateBuffered: function(audio) {
		if (this.isDestroying || this.isDestroyed) {
			return;
		}
		if (audio.buffered.length > 0) {
			const buffered = audio.buffered.end(audio.buffered.length - 1),
				duration = audio.duration;
			this.set('_percentBuffered', `${(buffered / duration) * 100}%`);
		}
	},
	updateDuration: function(audio) {
		if (this.isDestroying || this.isDestroyed) {
			return;
		}
		this.set('_durationDisplay', this._secondsToDisplay(audio.duration));
	},
	updateTimeAndPercent: function(audio) {
		if (this.isDestroying || this.isDestroyed) {
			return;
		}
		const currentTime = audio.currentTime,
			duration = audio.duration,
			currentDisplay = this._secondsToDisplay(currentTime);
		this.setProperties({
			_currentTimeDisplay: currentDisplay,
			_percentComplete: `${(currentTime / duration) * 100}%`
		});
	},

	// Sliders
	// -------

	adjustTimeSlider: function(audio, $progress, event) {
		const duration = audio.duration,
			ratio = this._getRatioFromBar($progress, event);
		audio.currentTime = ratio * duration;
	},
	adjustVolumeSlider: function($volume, event) {
		const ratio = this._getRatioFromBar($volume, event);
		this.set('_volume', this.normalizeVolume(ratio * 100));
	},

	// Playback
	// --------

	play: function() {
		const audio = this.get('_audio');
		if (Ember.isPresent(audio)) {
			audio.play();
		}
		this.set('_isPlaying', true);
	},
	pause: function() {
		const audio = this.get('_audio');
		if (Ember.isPresent(audio)) {
			audio.pause();
		}
		this.set('_isPlaying', false);
	},

	// Volume
	// -------

	setVolume: function(audio, volume) {
		const normalized = this.normalizeVolume(volume);
		if (Ember.isPresent(audio)) {
			audio.volume = normalized / 100;
		}
	},
	normalizeVolume: function(volume) {
		return Math.round(Math.min(Math.max(volume, 0), 100));
	},

	// Helpers
	// -------

	_bindSliderHandlers: function(selector, action, delay) {
		const self = this,
			elId = this.elementId,
			doStopTracking = this._buildStopTrackingHandler(elId);
		// need to resort to event delegation because hide-away destroys
		// the DOM nodes on closing, removing attached event handlers AND
		// because rerender results in multiple event handlers attached
		this.$()
			.on(`mousedown.${elId}`, selector, function(event) {
				const $el = Ember.$(this);
				action($el, event);
				$el.on(`mousemove.${elId}`, function(event1) {
					Ember.run.throttle(self, action, $el, event1, delay, false);
				});
			})
			.on(`mouseup.${elId}`, selector, doStopTracking)
			.on(`mouseleave.${elId}`, selector, doStopTracking);
	},
	_buildStopTrackingHandler: function(elementId) {
		return function() {
			const $el = Ember.$(this);
			$el.off(`mousemove.${elementId}`);
		};
	},
	_getRatioFromBar: function($obj, event) {
		var totalWidth = $obj.width(),
			//jQuery normalizes event.pageX to the document so we
			//offset, which also is relative to the document
			seekToWidth = event.pageX - $obj.offset().left;
		return seekToWidth / totalWidth;
	},
	_secondsToDisplay: function(numSeconds) {
		if (!Ember.isPresent(numSeconds) || isNaN(numSeconds)) {
			return '';
		}
		const duration = moment.duration(numSeconds, 'seconds');
		return `${duration.minutes()}:${this._padLeft(duration.seconds())}`;
	},
	_padLeft: function(string, padWith = '0', numDigits = 2) {
		let newStr = string + '';
		while (newStr.length < numDigits) {
			newStr = padWith + newStr;
		}
		return newStr;
	}
});
