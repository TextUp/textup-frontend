import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import MediaElement from 'textup-frontend/models/media-element';
import { moduleForModel, test } from 'ember-qunit';

const { run, typeOf } = Ember;

moduleForModel('media/add', 'Unit | Model | media/add', {
  needs: ['model:media-element', 'model:media-element-version'],
});

test('computed properties', function(assert) {
  run(() => {
    const obj = this.subject(),
      randVal1 = Math.random(),
      fakeData = `base64,${randVal1}`;

    assert.notOk(obj.get('checksum'));
    assert.notOk(obj.get('dataNoHeader'));

    obj.setProperties({ mediaData: fakeData });

    assert.equal(obj.get('dataNoHeader'), randVal1 + '');
    assert.ok(obj.get('checksum'));
    assert.equal(typeOf(obj.get('isDirty')), 'boolean');
    assert.ok(
      obj.get(Constants.PROP_NAME.MEDIA_ID),
      'unique id for this add change is automatically generated upon request'
    );
  });
});

test('building media element', function(assert) {
  run(() => {
    const obj = this.subject(),
      randVal1 = Math.random(),
      randVal2 = Math.random(),
      randVal3 = Math.random(),
      randVal4 = Math.random(),
      fakeData = `base64,${randVal1}`;

    obj.setProperties({
      mediaData: fakeData,
      mimeType: randVal2,
      width: randVal3,
      height: randVal4,
    });

    const el = obj.toMediaElement();

    assert.ok(el instanceof MediaElement);
    assert.equal(el.get(Constants.PROP_NAME.MEDIA_ID), obj.get(Constants.PROP_NAME.MEDIA_ID));
    assert.equal(el.get('versions.length'), 1);
    assert.deepEqual(
      el.get('versions.firstObject').getProperties('type', 'source', 'width', 'height'),
      {
        type: randVal2 + '',
        source: fakeData,
        width: parseInt(randVal3),
        height: parseInt(randVal4),
      }
    );
  });
});
