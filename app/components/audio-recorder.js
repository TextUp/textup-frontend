import Component from '@ember/component';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';
import { tryInvoke } from '@ember/utils';
import Constants from 'textup-frontend/constants';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import AudioRecording from 'textup-frontend/objects/audio-recording';
import {
  isRecordingSupported,
  blobToBase64String
} from 'textup-frontend/utils/audio';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    onError: PropTypes.func,
    onFinish: PropTypes.func,
    disabled: PropTypes.bool,

    message: PropTypes.string,
    unsupportedMessage: PropTypes.string,
    startMessage: PropTypes.string,
    recordingMessage: PropTypes.string,
    processingMessage: PropTypes.string,
  },
  getDefaultProps() {
    return {
      disabled: false,
      unsupportedMessage: 'Audio recording is not supported by your browser',
      startMessage: 'Select to start recording',
      recordingMessage: 'Recording...',
      processingMessage: 'Processing...',
    };
  },

  classNames: ['audio-control', 'audio-control--recording'],
  classNameBindings: [
    '_isUnsupported:audio-control--unsupported',
    '_errorMessage:audio-control--error',
    'disabled:audio-control--disabled',
  ],

  didInsertElement() {
    this._super(...arguments);
    if (!isRecordingSupported()) {
      run.scheduleOnce('afterRender', () => this.set('_isUnsupported', true));
    }
  },

  // Internal properties
  // -------------------

  _isUnsupported: false,
  _errorMessage: null,

  _recorder: null,
  _isProcessing: false,

  _maxTime: computed('_recorder', function() {
    return this.get('_recorder') ? Constants.AUDIO.MAX_DURATION_IN_SECONDS : null;
  }),
  _currentTime: computed('_recorder', '_recordingDurationSoFar', function() {
    return this.get('_recorder') ? this.get('_recordingDurationSoFar') : null;
  }),
  _recordingDurationSoFar: null,
  _timerIntervalId: null,
  _startTimeInMillis: null,

  _message: computed(
    'message',
    '_isUnsupported',
    'unsupportedMessage',
    '_errorMessage',
    '_recorder',
    '_isProcessing',
    'recordingMessage',
    'processingMessage',
    'startMessage',
    function() {
      if (this.get('message')) {
        return this.get('message');
      } else if (this.get('_isUnsupported')) {
        return this.get('unsupportedMessage');
      } else if (this.get('_errorMessage')) {
        return this.get('_errorMessage');
      } else if (this.get('_recorder')) {
        return this.get('_isProcessing')
          ? this.get('processingMessage')
          : this.get('recordingMessage');
      } else {
        return this.get('startMessage');
      }
    }
  ),

  // Internal handlers
  // -----------------

  _toggleRecording() {
    if (this.get('disabled') || this.get('_isUnsupported')) {
      return;
    }
    if (this.get('_recorder')) {
      this._stopRecording();
    } else {
      this._startRecording();
    }
  },
  _startRecording() {
    const recorder = AudioRecording.create();
    recorder.on('error', this, this._onErrorState);
    recorder.on('dataavailable', this, this._onRecordingFinish);
    recorder.startRecording();
    this._onStartState(recorder);
  },
  _stopRecording() {
    const recorder = this.get('_recorder');
    if (recorder) {
      recorder.stopRecording();
      this.set('_isProcessing', true);
    }
  },
  _onRecordingFinish(blob) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    blobToBase64String(blob).then(data => {
      tryInvoke(this, 'onFinish', [blob.type, data]);
      this._onFinishState();
    }, this._onErrorState.bind(this));
  },

  // Status handlers
  // ---------------

  _onStartState(recorder) {
    const intervalId = setInterval(this._updateRecordingTimeAtInterval.bind(this), 1000);
    this.setProperties({
      _recorder: recorder,
      _isProcessing: false,
      _errorMessage: null,
      _timerIntervalId: intervalId,
      _startTimeInMillis: Date.now(),
    });
  },
  _onFinishState() {
    this.setProperties({ _recorder: null, _isProcessing: false, _startTimeInMillis: null });
  },
  _onErrorState(message) {
    this.set('_errorMessage', message);
    tryInvoke(this, 'onError', [message]);
  },

  // Recording time display
  // ----------------------

  _updateRecordingTimeAtInterval() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      this._clearIntervalTimer();
      return;
    }
    const startTime = this.get('_startTimeInMillis');
    if (startTime) {
      const millisElapsed = Date.now() - startTime;
      run(() => {
        this.set('_recordingDurationSoFar', Math.floor(millisElapsed / 1000));
      });
    }
  },
  _clearIntervalTimer() {
    const intervalId = this.get('timerIntervalId');
    if (intervalId) {
      clearInterval(intervalId);
    }
  },
});
