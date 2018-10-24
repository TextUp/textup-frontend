import 'npm:webrtc-adapter'; // standardize getUserMedia API, where available
import Ember from 'ember';
import MediaRecorderPolyfill from 'npm:audio-recorder-polyfill';
import { compressAudioArrayBuffer } from 'textup-frontend/utils/audio-compression';

const { RSVP } = Ember;

export function getAudioStream() {
  return new RSVP.Promise((resolve, reject) => {
    if (!isRecordingSupported()) {
      return reject('Audio recording is not available in this browser.');
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
      .then(resolve)
      .catch(reject);
  });
}

export function isRecordingSupported() {
  return navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
}

export function getAudioRecorder(stream) {
  const RecordConstructor = window.MediaRecorder ? window.MediaRecorder : MediaRecorderPolyfill;
  return new RecordConstructor(stream);
}

// only compress audio file if it is uncompressed PCM audio date stored in a WAV container
export function tryCompressAudioBlob(blob) {
  return new RSVP.Promise((resolve, reject) => {
    if (!(blob instanceof Blob)) {
      return reject(blob);
    }
    if (blob.type !== 'audio/wav') {
      return resolve(blob);
    }
    const fr = new FileReader();
    fr.onloadend = () => {
      if (fr.error) {
        reject(fr.error);
      } else {
        resolve(compressAudioArrayBuffer(fr.result));
      }
    };
    fr.readAsArrayBuffer(blob);
  });
}
