import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { blobToBase64String } from 'textup-frontend/utils/audio-compression';
import {
  isRecordingSupported,
  getAudioStream,
  getAudioRecorder,
  tryCompressAudioBlob
} from 'textup-frontend/utils/audio';

const { computed, run, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  constants: Ember.inject.service(),

  propTypes: {
    onStart: PropTypes.func,
    onFinish: PropTypes.func,
    disabled: PropTypes.bool,
    message: PropTypes.string,
    errorMessage: PropTypes.string,
    startMessage: PropTypes.string,
    recordingMessage: PropTypes.string,
    processingMessage: PropTypes.string
  },
  getDefaultProps() {
    return {
      disabled: false,
      errorMessage: 'Audio recording is not supported by your browser',
      startMessage: 'Select to start recording',
      recordingMessage: 'Recording...',
      processingMessage: 'Processing...'
    };
  },

  classNames: ['audio-control', 'audio-control--recording'],
  classNameBindings: ['_isDisabled:audio-control--disabled'],

  didInsertElement() {
    this._super(...arguments);
    if (!isRecordingSupported()) {
      run.scheduleOnce('afterRender', this._onError.bind(this));
    }
  },
  willDestroyElement() {
    this._super(...arguments);
    this._finishRecordingStatus();
  },

  // Internal properties
  // -------------------

  _isError: false,
  _isDisabled: computed('disabled', '_isError', function() {
    return this.get('disabled') || this.get('_isError');
  }),

  _recorder: null,
  _isProcessing: false,

  _message: computed(
    '_isError',
    '_recorder',
    '_isProcessing',
    'errorMessage',
    'startMessage',
    'recordingMessage',
    'processingMessage',
    function() {
      if (this.get('_isError')) {
        return this.get('errorMessage');
      } else if (this.get('_recorder')) {
        return this.get('_isProcessing')
          ? this.get('processingMessage')
          : this.get('recordingMessage');
      } else {
        return this.get('startMessage');
      }
    }
  ),
  _maxTime: computed('_recorder', function() {
    return this.get('_recorder') ? this.get('constants.AUDIO.MAX_DURATION_IN_SECONDS') : null;
  }),

  _currentTime: computed('_recorder', '_recordingDurationSoFar', function() {
    return this.get('_recorder') ? this.get('_recordingDurationSoFar') : null;
  }),
  _recordingDurationSoFar: null,
  _timerIntervalId: null,
  _startTimeInMillis: null,

  // Internal handlers
  // -----------------

  _toggleRecording() {
    if (this.get('_isDisabled')) {
      return;
    }
    if (this.get('_recorder')) {
      this._stopRecording();
    } else {
      this._startRecording();
    }
  },
  _startRecording() {
    getAudioStream().then(stream => {
      const recorder = getAudioRecorder(stream);
      recorder.addEventListener('dataavailable', this._onRecordingFinish.bind(this));
      recorder.addEventListener('onerror', this._onError.bind(this));
      this._startRecordingStatus(recorder);
      // Start recording
      recorder.start();
    }, this._onError.bind(this));
  },
  _stopRecording() {
    const recorder = this.get('_recorder');
    // Stop recording
    recorder.stop();
    // Remove “recording” icon from browser tab
    recorder.stream.getTracks().forEach(i => i.stop());
  },

  _onRecordingFinish(event) {
    if (this.get('isDestroying') || this.get('isDestroyed') || this.get('_isDisabled')) {
      return;
    }
    this._processingRecordingStatus();
    tryCompressAudioBlob(event.data).then(
      blob => this._finishRecordingStatus(blob),
      this._onError.bind(this)
    );
  },

  _updateRecordingTime() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      this._clearIntervalTimer();
      return;
    }
    const millisElapsed = Date.now() - this.get('_startTimeInMillis');
    this.set('_recordingDurationSoFar', Math.floor(millisElapsed / 1000));
  },
  _onError() {
    this.set('_isError', true);
  },

  _startRecordingStatus(recorder) {
    tryInvoke(this, 'onStart');
    this.setProperties({
      _recorder: recorder,
      _isError: false,
      _isProcessing: false,
      _timerIntervalId: setInterval(this._updateRecordingTime.bind(this), 1000),
      _startTimeInMillis: Date.now()
    });
  },
  _processingRecordingStatus() {
    this.setProperties({
      _isError: false,
      _isProcessing: true
    });
  },
  _finishRecordingStatus(blob = null) {
    this._clearIntervalTimer();
    if (blob) {
      blobToBase64String(blob).then(
        data => tryInvoke(this, 'onFinish', [blob.type, data]),
        this._onError.bind(this)
      );
    }
    this.setProperties({
      _recorder: null,
      _isError: false,
      _isProcessing: false,
      _recordingDurationSoFar: null,
      _timerIntervalId: null,
      _startTimeInMillis: null
    });
  },

  _clearIntervalTimer() {
    const intervalId = this.get('timerIntervalId');
    if (intervalId) {
      clearInterval(intervalId);
    }
  }
});
