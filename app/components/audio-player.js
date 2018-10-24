import Ember from 'ember';
import MediaElement from 'textup-frontend/models/media-element';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    audio: PropTypes.oneOfType([PropTypes.null, PropTypes.instanceOf(MediaElement)]),
    disabled: PropTypes.bool,
    message: PropTypes.string,
    errorMessage: PropTypes.string
  },
  getDefaultProps() {
    return { disabled: false, errorMessage: 'Cannot play audio' };
  },

  classNames: ['audio-control'],
  classNameBindings: ['_isDisabled:audio-control--disabled'],

  // Internal properties
  // -------------------

  _isError: false,
  _isDisabled: computed('disabled', '_isError', function() {
    return this.get('disabled') || this.get('_isError');
  }),

  _isPlaying: false,
  _isLoading: false,

  _message: computed('_isError', 'errorMessage', function() {
    return this.get('_isError') ? this.get('errorMessage') : null;
  }),
  _currentTime: null,
  _maxTime: null,

  _audioElement: computed('audio', function() {
    return this.$('audio')[0];
  }),

  // Internal handlers
  // -----------------

  _togglePlay() {
    if (this.get('_isDisabled')) {
      return;
    }
    const audioElement = this.get('_audioElement');
    if (this.get('_isPlaying')) {
      audioElement.pause();
      this._stopPlayingStatus();
    } else {
      audioElement.play();
      audioElement.volume = 1;
      this._startPlayingStatus();
    }
  },

  _startPlayingStatus() {
    this.setProperties({
      _isPlaying: true,
      _isError: false
    });
  },
  _stopPlayingStatus() {
    this.setProperties({
      _isPlaying: false,
      _isError: false,
      _isLoading: false
    });
  },

  _onWaiting() {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('_isDisabled')) {
      return;
    }
    this.set('_isLoading', true);
  },
  _onPlaying() {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('_isDisabled')) {
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
  _onError() {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('_isDisabled')) {
      return;
    }
    this.set('_isError', true);
  },
  _onLoadedMetadata() {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('_isDisabled')) {
      return;
    }
    const audioElement = this.get('_audioElement');
    this.setProperties({
      _currentTime: audioElement.currentTime,
      _maxTime: audioElement.duration
    });
  },
  _onCurrentTimeUpdated() {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('_isDisabled')) {
      return;
    }
    this.set('_currentTime', this.get('_audioElement.currentTime'));
  },
  _onMaxTimeUpdated() {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('_isDisabled')) {
      return;
    }
    this.set('_maxTime', this.get('_audioElement.duration'));
  },
  _onFinishedPlaying() {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('_isDisabled')) {
      return;
    }
    // setting currentTime automatically triggers ontimechange
    this.get('_audioElement').currentTime = 0;
    this._stopPlayingStatus();
  }
});
