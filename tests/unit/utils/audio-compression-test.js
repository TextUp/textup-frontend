import { module, test } from 'qunit';
import {
  blobToBase64String,
  compressAudioArrayBuffer
} from 'textup-frontend/utils/audio-compression';

module('Unit | Utility | audio compression');

test('converting Blob to base64 encoded string', function(assert) {
  const done = assert.async();

  blobToBase64String()
    .catch(error => {
      assert.equal(error, undefined, 'invalid input passes through');
      return blobToBase64String(null);
    })
    .catch(error => {
      assert.equal(error, null, 'invalid input passes through');
      return blobToBase64String(888);
    })
    .catch(error => {
      assert.equal(error, 888, 'invalid input passes through');
      return blobToBase64String('hi');
    })
    .catch(error => {
      assert.equal(error, 'hi', 'invalid input passes through');
      return blobToBase64String([]);
    })
    .catch(error => {
      assert.deepEqual(error, [], 'invalid input passes through');
      return blobToBase64String({});
    })
    .catch(error => {
      assert.deepEqual(error, {}, 'invalid input passes through');
      return blobToBase64String(new window.Blob([1, 1, 1], { type: 'audio/mpeg' }));
    })
    .then(base64String => {
      assert.equal(base64String, 'data:audio/mpeg;base64,MTEx');
      done();
    });
});

// [FUTURE] figure out how to generate sample wav byte data to pass in
test('compressing audio invalid inputs', function(assert) {
  assert.equal(compressAudioArrayBuffer(), undefined, 'invalid inputs pass through');
  assert.equal(compressAudioArrayBuffer(null), null, 'invalid inputs pass through');
  assert.equal(compressAudioArrayBuffer(888), 888, 'invalid inputs pass through');
  assert.equal(compressAudioArrayBuffer('hi'), 'hi', 'invalid inputs pass through');
  assert.deepEqual(compressAudioArrayBuffer([]), [], 'invalid inputs pass through');
  assert.deepEqual(compressAudioArrayBuffer({}), {}, 'invalid inputs pass through');
});
