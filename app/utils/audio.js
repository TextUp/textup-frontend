import 'npm:webrtc-adapter'; // standardize getUserMedia API, where available
import Ember from 'ember';

const { RSVP, typeOf } = Ember;

export function isRecordingSupported() {
  return (
    navigator &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    (window.AudioContext || window.webkitAudioContext)
  );
}

export function getAudioStream() {
  return new RSVP.Promise((resolve, reject) => {
    if (!isRecordingSupported()) {
      return reject('Audio recording is not available in this browser.');
    }
    // NOTE: on iOS and other browsers, this call only works in HTTPS contexts
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

export function blobToBase64String(blob) {
  return new RSVP.Promise((resolve, reject) => {
    if (!(blob instanceof Blob)) {
      return reject('blobToBase64String: input is not instance of a Blob');
    }
    const fr = new FileReader();
    fr.onloadend = event => {
      const contents = event.target.result,
        error = event.target.error;
      if (error != null) {
        reject(humanizeFileReaderError(error));
      } else {
        resolve(contents);
      }
    };
    fr.readAsDataURL(blob);
  });
}

// Error is assumed to be a FileError, but interface is not well supported
function humanizeFileReaderError(error) {
  if (!error) {
    return;
  }
  // see https://humanwhocodes.com/blog/2012/05/22/working-with-files-in-javascript-part-3/
  // see https://www.htmlgoodies.com/html5/other/responding-to-html5-filereader-events.html
  switch (error) {
    case error.ENCODING_ERR:
      return 'Unable to encode file in the desired encoding';
    case error.SECURITY_ERR:
      return 'File could not be accessed';
    case error.ABORT_ERR:
      return 'Reading this file was cancelled';
    case error.NOT_READABLE_ERR:
      return 'This file could not be read';
    case error.NOT_FOUND_ERR:
      return 'This file could not be found';
    default:
      return 'Unknown error occurred when reading file';
  }
}

// Error is assumed to be a MediaError a very well-supported interface
export function humanizeMediaError(error) {
  if (!error || typeOf(error) !== 'object') {
    return;
  }
  // if already has detailed diagnostic info available, just use that
  if (error.message) {
    return error.message;
  }
  // see https://developer.mozilla.org/en-US/docs/Web/API/MediaError
  switch (error.code) {
    case window.MediaError.MEDIA_ERR_ABORTED:
      return 'Request to fetch media was cancelled';
    case window.MediaError.MEDIA_ERR_NETWORK:
      return 'Network error when trying to load media';
    case window.MediaError.MEDIA_ERR_DECODE:
      return 'Could not decode media';
    case window.MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return 'Media is in an unsupported format';
    default:
      return 'Unknown media error has occurred';
  }
}
