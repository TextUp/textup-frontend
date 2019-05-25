import Component from '@ember/component';
import MediaElement from 'textup-frontend/models/media-element';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { computed } from '@ember/object';
import { humanizeMediaError } from 'textup-frontend/utils/audio';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    audio: PropTypes.oneOfType([PropTypes.null, PropTypes.instanceOf(MediaElement)]),
    disabled: PropTypes.bool,
    message: PropTypes.string,
  }),
  getDefaultProps() {
    return { disabled: false };
  },

  classNames: ['audio-control'],
  classNameBindings: ['disabled:audio-control--disabled', '_errorMessage:audio-control--error'],

  // ON SUBSEQUENT RERENDERS ONLY, trigger rebuild on audio element if source audio data changes
  didUpdateAttrs() {
    this._super(...arguments);
    this._tryRebuildAudioElement();
  },
  // On both initial render and subsequent re-renders, store a reference to the current audio data
  // in order to enable checking on subsequent re-renders to see if audio element should reload
  // NOTE: this hook is called AFTER `didUpdateAttrs` on re-renders do we can still detect
  // changes in `didUpdateAttrs` before `_previousFirstSourceUrl` is overwritten in this hook
  didReceiveAttrs() {
    this._super(...arguments);
    this.set('_previousFirstSourceUrl', this.get('audio.versions.content.firstObject.source'));
  },

  // Internal properties
  // -------------------

  _isPlaying: false,
  _isLoading: false,

  _errorMessage: null,
  _message: computed('message', '_errorMessage', function() {
    return this.get('message') || this.get('_errorMessage');
  }),
  _currentTime: null,
  _maxTime: null,

  _previousFirstSourceUrl: null,
  _audioElement: computed(function() {
    return this.$('audio')[0];
  }),

  // Internal handlers
  // -----------------

  _tryRebuildAudioElement() {
    const prevAudioFirstSource = this.get('_previousFirstSourceUrl'),
      currAudioFirstSource = this.get('audio.versions.content.firstObject.source');
    if (!currAudioFirstSource || currAudioFirstSource === prevAudioFirstSource) {
      return;
    }
    const audioElement = this.get('_audioElement');
    if (audioElement) {
      audioElement.load();
      this._onResettingState();
    }
  },

  _togglePlay() {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('disabled')) {
      return;
    }
    const audioElement = this.get('_audioElement');
    audioElement.volume = 1;
    if (this.get('_isPlaying')) {
      audioElement.pause();
      this._onStoppedState();
    } else {
      audioElement.play();
      this._onPlayingState();
    }
  },

  _onResettingState() {
    this.setProperties({ _currentTime: null, _maxTime: null });
    this._onStoppedState();
  },
  _onPlayingState() {
    this.setProperties({ _isPlaying: true, _errorMessage: null });
  },
  _onStoppedState() {
    this.setProperties({ _isPlaying: false, _errorMessage: null, _isLoading: false });
  },

  _onLoadStart() {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('disabled')) {
      return;
    }
    this.set('_isLoading', true);
  },
  _onLoadStop() {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('disabled')) {
      return;
    }
    this.set('_isLoading', false);
  },
  _onSeek(percentage) {
    const maxTime = this.get('_maxTime');
    if (!maxTime) {
      return;
    }
    // setting currentTime automatically triggers ontimechange
    this.get('_audioElement').currentTime = percentage * maxTime;
  },
  _onError(mediaError) {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('disabled')) {
      return;
    }
    this.set('_errorMessage', humanizeMediaError(mediaError));
  },
  _onLoadedMetadata() {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('disabled')) {
      return;
    }
    const { currentTime, duration } = this.get('_audioElement');
    this.setProperties({ _currentTime: currentTime, _maxTime: duration });
    this._onLoadStop();
  },
  _onCurrentTimeUpdated() {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('disabled')) {
      return;
    }
    this.set('_currentTime', this.get('_audioElement.currentTime'));
  },
  _onMaxTimeUpdated() {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('disabled')) {
      return;
    }
    this.set('_maxTime', this.get('_audioElement.duration'));
  },
  _onFinishedPlaying() {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('disabled')) {
      return;
    }
    // setting currentTime automatically triggers ontimechange
    this.get('_audioElement').currentTime = 0;
    this._onStoppedState();
  },
});
