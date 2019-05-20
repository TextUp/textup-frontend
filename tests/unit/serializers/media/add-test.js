import { run } from '@ember/runloop';
import Constants from 'textup-frontend/constants';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('media/add', 'Unit | Serializer | media/add', {
  needs: ['serializer:media/add'],
});

test('build add action', function(assert) {
  run(() => {
    const obj = this.subject(),
      data = `${Math.random()}`;

    obj.setProperties({ mediaData: `base64,${data}`, mimeType: `${Math.random()}` });

    const serialized = obj.serialize();

    assert.equal(serialized.action, Constants.ACTION.MEDIA.ADD);
    assert.equal(serialized.mimeType, obj.get('mimeType'));
    assert.equal(serialized.data, obj.get('dataNoHeader'));
    assert.equal(serialized.data, data);
    assert.equal(serialized.checksum, obj.get('checksum'));
    assert.ok(serialized.checksum);
  });
});
