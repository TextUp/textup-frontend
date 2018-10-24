import * as AudioCompressionUtils from 'textup-frontend/utils/audio-compression';
import MediaRecorderPolyfill from 'npm:audio-recorder-polyfill';
import sinon from 'sinon';
import { module, test } from 'qunit';
import {
  getAudioStream,
  getAudioRecorder,
  tryCompressAudioBlob
} from 'textup-frontend/utils/audio';

module('Unit | Utility | audio');

test('getting audio stream', function(assert) {
  const done = assert.async();

  let getUserMediaStub;
  getAudioStream()
    .then(stream => {
      assert.ok(stream instanceof window.MediaStream, 'successfully grabs stream');

      // make getUserMedia return null
      getUserMediaStub = sinon.stub(window.navigator.mediaDevices, 'getUserMedia').get(() => null);
      return getAudioStream();
    })
    .catch(error => {
      assert.ok(error.includes('not available'), 'promise rejects when api is not available');

      getUserMediaStub.restore();
      done();
    });
});

test('getting audio recorder', function(assert) {
  assert.throws(() => getAudioRecorder(), 'invalid input -- not a stream');
  assert.throws(() => getAudioRecorder('hi'), 'invalid input -- not a stream');
  assert.throws(() => getAudioRecorder([]), 'invalid input -- not a stream');
  assert.throws(() => getAudioRecorder({}), 'invalid input -- not a stream');

  const recorder = getAudioRecorder(new window.MediaStream());
  assert.ok(recorder instanceof window.MediaRecorder || recorder instanceof MediaRecorderPolyfill);
});

test('trying to compress audio stream', function(assert) {
  const done = assert.async(),
    compressStub = sinon.stub(AudioCompressionUtils, 'compressAudioArrayBuffer');

  tryCompressAudioBlob()
    .catch(error => {
      assert.ok(compressStub.notCalled);
      assert.equal(error, undefined, 'invalid input passes through');

      return tryCompressAudioBlob(null);
    })
    .catch(error => {
      assert.ok(compressStub.notCalled);
      assert.equal(error, null, 'invalid input passes through');

      return tryCompressAudioBlob(888);
    })
    .catch(error => {
      assert.ok(compressStub.notCalled);
      assert.equal(error, 888, 'invalid input passes through');

      return tryCompressAudioBlob('hi');
    })
    .catch(error => {
      assert.ok(compressStub.notCalled);
      assert.equal(error, 'hi', 'invalid input passes through');

      return tryCompressAudioBlob([]);
    })
    .catch(error => {
      assert.ok(compressStub.notCalled);
      assert.deepEqual(error, [], 'invalid input passes through');

      return tryCompressAudioBlob({});
    })
    .catch(error => {
      assert.ok(compressStub.notCalled);
      assert.deepEqual(error, {}, 'invalid input passes through');

      return tryCompressAudioBlob(new window.Blob([1, 1, 1], { type: 'audio/mpeg' }));
    })
    .then(() => {
      assert.ok(compressStub.notCalled);

      return tryCompressAudioBlob(new window.Blob([1, 1, 1], { type: 'audio/wav' }));
    })
    .then(() => {
      assert.ok(compressStub.calledOnce, 'compression is only called on audio/wav');

      compressStub.restore();
      done();
    });
});
