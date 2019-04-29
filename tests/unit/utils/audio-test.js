import AudioUtils from 'textup-frontend/utils/audio';
import Ember from 'ember';
import sinon from 'sinon';
import { module, test } from 'qunit';

const { typeOf } = Ember;

module('Unit | Utility | audio');

test('determining if audio recording is supported', function(assert) {
  assert.ok(AudioUtils.isRecordingSupported(), 'usually recording in some form is supported');

  const getUserMediaStub = sinon
    .stub(window.navigator.mediaDevices, 'getUserMedia')
    .get(() => null);
  assert.notOk(AudioUtils.isRecordingSupported(), 'not supported if cannot get media stream');
  getUserMediaStub.restore();
  assert.ok(AudioUtils.isRecordingSupported(), 'reset state');

  const originalAudioContext = window.AudioContext;
  window.AudioContext = null;
  window.webkitAudioContext = null;
  assert.notOk(AudioUtils.isRecordingSupported(), 'not supported if cannot get audio context');
  window.AudioContext = originalAudioContext;
  assert.ok(AudioUtils.isRecordingSupported(), 'reset state');
});

test('getting audio stream', function(assert) {
  const done = assert.async();

  let getUserMediaStub;
  AudioUtils.getAudioStream()
    .then(stream => {
      assert.ok(stream instanceof window.MediaStream, 'successfully grabs stream');

      // make getUserMedia return null
      getUserMediaStub = sinon.stub(window.navigator.mediaDevices, 'getUserMedia').get(() => null);
      return AudioUtils.getAudioStream();
    })
    .catch(error => {
      assert.ok(error.indexOf('not available') > -1, 'promise rejects when api is not available');

      getUserMediaStub.restore();
      done();
    });
});

test('converting Blob to base64 encoded string', function(assert) {
  const done = assert.async();

  AudioUtils.blobToBase64String()
    .catch(error => {
      assert.ok(typeOf(error) === 'string', 'returns error message');
      return AudioUtils.blobToBase64String(null);
    })
    .catch(error => {
      assert.ok(typeOf(error) === 'string', 'returns error message');
      return AudioUtils.blobToBase64String(888);
    })
    .catch(error => {
      assert.ok(typeOf(error) === 'string', 'returns error message');
      return AudioUtils.blobToBase64String('hi');
    })
    .catch(error => {
      assert.ok(typeOf(error) === 'string', 'returns error message');
      return AudioUtils.blobToBase64String([]);
    })
    .catch(error => {
      assert.ok(typeOf(error) === 'string', 'returns error message');
      return AudioUtils.blobToBase64String({});
    })
    .catch(error => {
      assert.ok(typeOf(error) === 'string', 'returns error message');
      return AudioUtils.blobToBase64String(new window.Blob([1, 1, 1], { type: 'audio/mpeg' }));
    })
    .then(base64String => {
      assert.equal(base64String, 'data:audio/mpeg;base64,MTEx');
      done();
    });
});

test('humanizing media error', function(assert) {
  const errorWithMsg = { message: Math.random() },
    errorWithCode = { code: window.MediaError.MEDIA_ERR_NETWORK },
    errorWithInvalidCode = { code: -88 };

  assert.notOk(AudioUtils.humanizeMediaError());
  assert.notOk(AudioUtils.humanizeMediaError('not an object'));
  assert.equal(AudioUtils.humanizeMediaError(errorWithMsg), errorWithMsg.message);
  assert.ok(
    AudioUtils.humanizeMediaError(errorWithCode)
      .toLowerCase()
      .indexOf('network') > -1
  );
  assert.ok(
    AudioUtils.humanizeMediaError(errorWithInvalidCode)
      .toLowerCase()
      .indexOf('unknown') > -1
  );
});
