import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import {
  MediaImage,
  MediaImageVersion,
  API_ID_PROP_NAME
} from 'textup-frontend/objects/media-image';

moduleFor('transform:media-collection', 'Unit | Transform | media collection');

test('deserializing (api <- app)', function(assert) {
  const obj = this.subject(),
    link = 'http://www.example.com',
    width = 888,
    height = 88;

  let result = obj.deserialize();
  assert.equal(Ember.isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.deserialize(null);
  assert.equal(Ember.isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.deserialize('not a list');
  assert.equal(Ember.isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.deserialize('not a list');
  assert.equal(Ember.isArray(result), true);
  assert.equal(result.length, 0);

  result = obj.deserialize(['not an object']);
  assert.equal(Ember.isArray(result), true);
  assert.equal(result.length, 0, 'ignore nonobject items in list');

  let mediaImages = obj.deserialize([{ random: null, keys: null }]);
  assert.equal(mediaImages.length, 1);
  assert.ok(mediaImages.get('firstObject') instanceof MediaImage);
  assert.notOk(mediaImages.get('firstObject').get(API_ID_PROP_NAME));
  assert.notOk(mediaImages.get('firstObject').get('mimeType'));
  assert.equal(mediaImages.get('firstObject.versions.length'), 0);

  mediaImages = obj.deserialize([{ [API_ID_PROP_NAME]: 'hello', random: { width, height } }]);
  assert.equal(mediaImages.length, 1);
  assert.ok(mediaImages.get('firstObject') instanceof MediaImage);
  assert.equal(mediaImages.get('firstObject').get(API_ID_PROP_NAME), 'hello');
  assert.notOk(mediaImages.get('firstObject').get('mimeType'));
  assert.equal(
    mediaImages.get('firstObject.versions.length'),
    0,
    'adding a version requires all of link to be present'
  );

  const input = [
    { [API_ID_PROP_NAME]: Math.random(), mimeType: Math.random(), small: { link, height, width } }
  ];
  mediaImages = obj.deserialize(input);
  assert.equal(mediaImages.length, 1);
  assert.ok(mediaImages.get('firstObject') instanceof MediaImage);
  assert.equal(mediaImages.get('firstObject').get(API_ID_PROP_NAME), input[0][API_ID_PROP_NAME]);
  assert.equal(mediaImages.get('firstObject.mimeType'), input[0].mimeType);
  assert.equal(mediaImages.get('firstObject.versions.length'), 1);
  assert.ok(mediaImages.get('firstObject.versions.firstObject') instanceof MediaImageVersion);
  assert.equal(mediaImages.get('firstObject.versions.firstObject.source'), link);
  assert.equal(mediaImages.get('firstObject.versions.firstObject.width'), width);
  assert.equal(mediaImages.get('firstObject.versions.firstObject.height'), height);
});

test('serializing (api -> app)', function(assert) {
  assert.equal(this.subject().serialize('hello'), 'hello', 'pass-through while serializing');
});
