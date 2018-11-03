import Ember from 'ember';
import { getAudioStream } from 'textup-frontend/utils/audio';

// Borrows heavily from: https://github.com/kaliatech/web-audio-recording-tests/blob/master/src/shared/RecorderService.js

const { computed, Evented, tryInvoke } = Ember,
  SCRIPT_PROCESSOR_BUFFER_SIZE = 2048,
  NUM_CHANNELS = 1;

export default Ember.Object.extend(Evented, {
  willDestroy() {
    this._super(...arguments);
    this._cleanup(); // ensure proper cleanup
  },

  // Public methods
  // --------------

  startRecording() {
    if (this.get('_isRecording')) {
      return;
    }
    this._cleanup();
    // need to start building the audio graph BEFORE the success handler after getting the audio
    // stream. The success handler of the getUserMedia is no longer in the context of the user click.
    // As a result, any audio context and processors created in the handler won't work.
    this._startBuildingAudioGraph();
    getAudioStream().then(this._connectSourceToAudioGraph.bind(this), this._onError.bind(this));
  },

  stopRecording() {
    if (!this.get('_isRecording')) {
      return;
    }
    const mediaRecorder = this.get('_mediaRecorder');
    if (mediaRecorder) {
      // can only stop if already recording
      if (mediaRecorder.status !== 'recording') {
        // triggers `dataavailable` event --> __handleDataAvailable
        mediaRecorder.stop();
      }
    } else {
      const encoderWorker = this.get('_encoderWorker');
      if (encoderWorker) {
        // after dumping data, encoderWorker will post a message --> _retrieveManuallyEncodedData
        encoderWorker.postMessage(['dump']);
      }
    }
  },

  // Internal properties
  // -------------------

  _context: null,
  _inputStream: null,
  _sourceNode: null,
  _inputGainNode: null,
  _outputGainNode: null,
  _destinationNode: null,

  _mediaRecorder: null,
  _encoderWorker: null,
  _scriptProcessor: null,

  _isRecording: computed('_mediaRecorder', '_scriptProcessor', function() {
    return this.get('_mediaRecorder') || this.get('_scriptProcessor');
  }),
  _supportsMediaRecorder: computed.notEmpty('window.MediaRecorder'),

  // Internal methods
  // ----------------

  _startBuildingAudioGraph() {
    // assume that AudioContext exists -- user shoudl check that one or the other exists
    // before attempting to start recording using `isRecordingSupported` in audio utils
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    // build nodes that will make up the audio graph
    const ctx = new window.AudioContext(),
      inputGainNode = ctx.createGain(),
      outputGainNode = ctx.createGain(),
      destinationNode = tryInvoke(ctx, 'createMediaStreamDestination') || ctx.destination;
    let encoderWorker, scriptProcessor;
    if (!this.get('_supportsMediaRecorder')) {
      encoderWorker = new Worker('/workers/mp3-encoder-worker.js');
      // Should pass in 0 to allow browser to select appropriate buffer value. HOWEVER, because
      // WebKit currently requires a valid buffer size here, we pass in a value. Also support mono.
      // see https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createScriptProcessor
      scriptProcessor = ctx.createScriptProcessor(
        SCRIPT_PROCESSOR_BUFFER_SIZE,
        NUM_CHANNELS,
        NUM_CHANNELS
      );
      encoderWorker.postMessage(['init', ctx.sampleRate]);
      encoderWorker.onmessage = this._retrieveManuallyEncodedData.bind(this);
      scriptProcessor.onaudioprocess = this._continueManuallyEncodingData.bind(this);
    }
    // connect WIP audio graph
    if (scriptProcessor) {
      inputGainNode.connect(scriptProcessor);
      scriptProcessor.connect(outputGainNode);
    } else {
      inputGainNode.connect(outputGainNode);
    }
    outputGainNode.connect(destinationNode);
    // preserve references to each node in the audio graph
    this.setProperties({
      _context: ctx,
      _inputGainNode: inputGainNode,
      _outputGainNode: outputGainNode,
      _destinationNode: destinationNode,
      _encoderWorker: encoderWorker,
      _scriptProcessor: scriptProcessor
    });
  },
  _connectSourceToAudioGraph(inputStream) {
    const ctx = this.get('_context'),
      inputGainNode = this.get('_inputGainNode'),
      outputGainNode = this.get('_outputGainNode'),
      scriptProcessor = this.get('_scriptProcessor'),
      destinationNode = this.get('_destinationNode'),
      sourceNode = ctx.createMediaStreamSource(inputStream);
    let mediaRecorder;
    // connect source node to the first node in the audio graph
    sourceNode.connect(inputGainNode);
    inputGainNode.gain.setValueAtTime(1.0, ctx.currentTime);
    // script processor is not created when the browser supports the MediaRecorder API
    if (!scriptProcessor) {
      mediaRecorder = new MediaRecorder(destinationNode.stream);
      mediaRecorder.ondataavailable = this._handleDataAvailable.bind(this);
      mediaRecorder.onerror = this._onError.bind(this);
      mediaRecorder.start();
    } else {
      // Output gain to zero to prevent feedback. Seems to matter only on Edge, though seems like should matter
      // on iOS too.  Matters on chrome when connecting graph to directly to audioCtx.destination, but we are
      // not able to do that when using MediaRecorder.
      outputGainNode.gain.setValueAtTime(0, ctx.currentTime);
    }
    // store references to additional created objects in the audio graph
    this.setProperties({
      _inputStream: inputStream,
      _sourceNode: sourceNode,
      _mediaRecorder: mediaRecorder
    });
  },

  // when MediaRecorder API NOT supported, called for script processor's audioprogress event
  _continueManuallyEncodingData({ inputBuffer }) {
    if (!this.get('_isRecording') || this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    const encoderWorker = this.get('_encoderWorker');
    if (encoderWorker && inputBuffer) {
      encoderWorker.postMessage(['encode', inputBuffer.getChannelData(0)]);
    }
  },
  // when MediaRecorder API NOT supported, called by web worker after dumping all data
  _retrieveManuallyEncodedData({ data }) {
    if (!this.get('_isRecording') || this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this._handleDataAvailable({ data: new Blob(data, { type: 'audio/mpeg' }) });
  },
  // when MediaRecorder API IS supported, called by MediaRecorder when recording is done
  _handleDataAvailable({ data }) {
    if (!this.get('_isRecording') || this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this._onFinish(data);
    this._cleanup();
  },

  _onError(domExceptionEvent) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this._cleanup();
    this.trigger(
      'error',
      domExceptionEvent ? domExceptionEvent.message : 'Could not record audio.'
    );
  },
  _onFinish(blob) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this.trigger('dataavailable', blob);
  },

  _cleanup() {
    const audioNodeProperties = [
        '_sourceNode',
        '_inputGainNode',
        '_outputGainNode',
        '_destinationNode',
        '_scriptProcessor'
      ],
      ctx = this.get('_context'),
      inputStream = this.get('_inputStream'),
      encoderWorker = this.get('_encoderWorker');
    // disconnect and clear references to all nodes in the audio graph
    audioNodeProperties.forEach(audioNodeProp => {
      const audioNode = this.get(audioNodeProp);
      if (audioNode) {
        audioNode.disconnect();
        this.set('audioNodeProp', null);
      }
    });
    // call appropriate clean-up methods for the other references
    if (encoderWorker) {
      encoderWorker.postMessage(['close']);
    }
    if (inputStream) {
      inputStream.getTracks().forEach(track => track.stop());
    }
    if (ctx) {
      ctx.close();
    }
    // clear references to these additional properties
    this.setProperties({
      _context: null,
      _inputStream: null,
      _encoderWorker: null,
      _mediaRecorder: null
    });
  }
});
