import { module, test } from 'qunit';
import {
  MediaImage,
  MediaImageVersion,
  API_ID_PROP_NAME
} from 'textup-frontend/objects/media-image';

module('Unit | Object | media image');

test('properties', function(assert) {
  const randVal1 = Math.random(),
    randVal2 = Math.random(),
    mediaImage = MediaImage.create({
      [API_ID_PROP_NAME]: randVal1,
      mimeType: randVal2
    });

  assert.equal(mediaImage.get(API_ID_PROP_NAME), randVal1);
  assert.equal(mediaImage.get('mimeType'), randVal2);
  assert.throws(() => mediaImage.set('versions', []), 'must use method to add versions');
});

test('adding versions', function(assert) {
  const randVal1 = Math.random(),
    randVal2 = Math.random(),
    mediaImage = MediaImage.create();

  assert.equal(mediaImage.get('versions.length'), 0, 'no versions to start off with');

  assert.notOk(mediaImage.addVersion(), 'returns false if missing source');
  assert.ok(mediaImage.addVersion(randVal1, 'ok', 'ok'), 'ok as long as has source defined');
  assert.ok(mediaImage.addVersion(randVal2, '88', '88'), 'will attempt to convert types');

  assert.equal(mediaImage.get('versions.length'), 2);
  assert.ok(mediaImage.get('versions.firstObject') instanceof MediaImageVersion);
  assert.ok(mediaImage.get('versions.lastObject') instanceof MediaImageVersion);
  assert.deepEqual(
    mediaImage.get('versions.firstObject'),
    MediaImageVersion.create({
      source: `${randVal1}`,
      width: null,
      height: null
    })
  );
  assert.deepEqual(
    mediaImage.get('versions.lastObject'),
    MediaImageVersion.create({
      source: `${randVal2}`,
      width: 88,
      height: 88
    })
  );
});
