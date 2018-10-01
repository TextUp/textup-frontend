import Ember from 'ember';
import MediaRecorderPolyfill from 'npm:audio-recorder-polyfill';
import 'npm:webrtc-adapter'; // standardize getUserMedia API, where available
import lamejs from 'npm:lamejs';

const { computed } = Ember;

export default Ember.Component.extend({
  didInsertElement() {
    this._super(...arguments);

    // TODO MediaRecorderPolyfill.notSupported is used to determine if polyfilling is possible at all
    // does not check to see if the polyfill needs to be applied or not
  },
  willDestroyElement() {
    this._super(...arguments);
    // if we're still creating object urls for the src property of he audio object because
    // we need to do processing on the mediastream, need to revoke the object url for optimal
    // memory management
  },

  // Internal properties
  // -------------------

  _recorder: null,

  // Internal handlers
  // -----------------

  _startRecording() {
    console.log('_startRecording');
    if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          sampleSize: 8,
          channelCount: 1
        }
      })
      .then(this._onStreamStart.bind(this))
      .catch(this._onStreamFailure.bind(this));

    // reset attribute, TODO remove
    const audio = this.get('element').querySelector('audio');
    audio.removeAttribute('src');
    const anchor = this.get('element').querySelector('a');
    anchor.href = '';
  },
  _stopRecording() {
    console.log('_stopRecording');
    const recorder = this.get('_recorder');
    console.log('\t recorder', recorder);
    if (!recorder) {
      console.log('\t SHORT CIRCUITING!');
      return;
    }
    // Stop recording
    recorder.stop();
    // Remove “recording” icon from browser tab
    recorder.stream.getTracks().forEach(i => i.stop());
  },

  _onStreamStart(stream) {
    const RecordConstructor = window.MediaRecorder ? window.MediaRecorder : MediaRecorderPolyfill,
      recorder = new RecordConstructor(stream);

    console.log('_onStreamStart RecordConstructor', RecordConstructor);
    console.log('\t recorder', recorder);
    console.log('\t recorder.mimeType', recorder.mimeType);

    // need to bind events using addEventListener for the polyfilled MediaRecorder to fire handlers
    recorder.addEventListener('dataavailable', this._onRecordingFinish.bind(this));
    recorder.addEventListener('onerror', this._onRecordingError.bind(this));

    this.set('_recorder', recorder);

    // Start recording
    recorder.start();
  },
  _onStreamFailure(error) {
    console.log('_onStreamFailure error: ', error);
  },

  _onRecordingFinish(event) {
    console.log('_onRecordingFinish event', event);
    console.log('\t event.data.size', event.data.size);
    console.log('\t event.data.type', event.data.type);

    const audio = document.querySelector('audio');

    let bUrl;
    if (event.data.type === 'audio/wav') {
      console.log('\t CONVERTING TO MP3!!!');
      // from https://stackoverflow.com/questions/37394541/how-to-convert-blob-to-int16array
      var fr = new FileReader();
      fr.onloadend = () => {
        console.log('FILE READER LOAD END fr.readyState', fr.readyState);

        // See https://github.com/zhuker/lamejs/blob/master/example.html
        var wav = lamejs.WavHeader.readHeader(new DataView(fr.result));
        console.log('wav:', wav);

        console.log('wav.sampleRate', wav.sampleRate);
        console.log('wav.dataLen', wav.dataLen);
        console.log('wav.dataOffset', wav.dataOffset);

        // remove the first 2.5 seconds of the recording to remove the "bang" sound that happens
        // when the recorded waves suddenly start. Visually, delay the "loading" state by the same
        // amount of time so that users know to start speaking after a slight delay.
        const amountToTrim = wav.sampleRate * 2.5;
        if (wav.dataLen < amountToTrim) {
          console.log('AUDIO SAMPLE TOO SHORT -- short circuiting');
          return;
        }

        var mp3encoder = new lamejs.Mp3Encoder(wav.channels, wav.sampleRate, 128);

        // var samples = new Int16Array(fr.result, wav.dataOffset, wav.dataLen / 2);
        var samples = new Int16Array(
          fr.result.slice(amountToTrim),
          wav.dataOffset,
          (wav.dataLen - amountToTrim) / 2
        );

        // var mp3Tmp = mp3encoder.encodeBuffer(new Int16Array(fr.result.slice(44)));

        var mp3Tmp = mp3encoder.encodeBuffer(samples);

        // from https://github.com/zhuker/lamejs/blob/master/example.html
        var buffer = [];
        buffer.push(new Int8Array(mp3Tmp));

        mp3Tmp = mp3encoder.flush();
        if (mp3Tmp.length > 0) {
          buffer.push(new Int8Array(mp3Tmp));
        }

        console.log('done encoding, size=', buffer.length);
        var blob = new Blob(buffer, { type: 'audio/mpeg' });
        console.log('MP3 blob.size', blob.size);
        bUrl = window.URL.createObjectURL(blob);
        console.log('Blob created, URL:', bUrl);
        audio.src = bUrl;
        this._setAnchorTag(blob);
      };
      fr.readAsArrayBuffer(event.data);
    } else {
      bUrl = URL.createObjectURL(event.data);
      audio.src = bUrl;
      this._setAnchorTag(event.data);
    }
  },
  _onRecordingError(error) {
    console.log('_onRecordingError error', error);
  },

  _setAnchorTag(blob) {
    const anchor = this.get('element').querySelector('a');
    const reader1 = new FileReader();
    reader1.onloadend = function() {
      anchor.href = reader1.result;
    };
    reader1.readAsDataURL(blob);
    console.log('DONE SETTING ANCHOR TAG!!!');
  }
});
