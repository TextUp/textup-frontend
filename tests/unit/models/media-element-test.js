import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import MediaElementVersion from 'textup-frontend/models/media-element-version';
import { moduleForModel, test } from 'ember-qunit';

const { run, typeOf } = Ember;

moduleForModel('media-element', 'Unit | Model | media element', {
  needs: ['model:media-element-version'],
});

test('properties', function(assert) {
  run(() => {
    const obj = this.subject(),
      randVal1 = Math.random();

    obj.set(Constants.PROP_NAME.MEDIA_ID, randVal1);

    assert.equal(obj.get(Constants.PROP_NAME.MEDIA_ID), randVal1);
    assert.equal(typeOf(obj.get('isDirty')), 'boolean');
    assert.throws(() => obj.set('versions', []), 'must use method to add versions');
  });
});

test('checking type of media', function(assert) {
  run(() => {
    const obj = this.subject();

    assert.notOk(obj.get('isImage'));
    assert.notOk(obj.get('isAudio'));

    obj.addVersion('audio/mpeg', 'base64;valid-audio-data');

    assert.notOk(obj.get('isImage'));
    assert.ok(obj.get('isAudio'));

    obj.addVersion('image/jpeg', 'base64;valid-image-data');

    assert.ok(obj.get('isImage'));
    assert.ok(obj.get('isAudio'));
  });
});

test('adding versions and rolling back', function(assert) {
  run(() => {
    const obj = this.subject(),
      randVal1 = Math.random(),
      randVal2 = Math.random(),
      type = 'image/png';

    assert.equal(obj.get('versions.length'), 0, 'no versions to start off with');

    assert.notOk(obj.addVersion(), 'returns false if missing type or source');
    assert.ok(obj.addVersion(type, randVal1, 'ok', 'ok'), 'ok as long as has source defined');
    assert.ok(obj.addVersion(type, randVal2, '88', '88'), 'will attempt to convert types');

    assert.equal(obj.get('versions.length'), 2);
    assert.ok(obj.get('versions.firstObject') instanceof MediaElementVersion);
    assert.ok(obj.get('versions.lastObject') instanceof MediaElementVersion);

    assert.deepEqual(
      obj.get('versions.firstObject').getProperties('type', 'source', 'width', 'height'),
      {
        type,
        source: `${randVal1}`,
        width: null,
        height: null,
      }
    );
    assert.deepEqual(
      obj.get('versions.lastObject').getProperties('type', 'source', 'width', 'height'),
      {
        type,
        source: `${randVal2}`,
        width: 88,
        height: 88,
      }
    );

    obj.rollbackAttributes();

    assert.equal(
      obj.get('versions.length'),
      0,
      'rolling back restores fragment array to initial empty state'
    );
  });
});
