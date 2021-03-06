import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('media-element', 'Unit | Serializer | media element', {
  needs: ['serializer:media-element', 'model:media-element-version', 'transform:fragment-array'],
});

test('serializes records', function(assert) {
  run(() => {
    const obj = this.subject();
    let serialized = obj.serialize();

    assert.notOk(serialized.uid);
    assert.equal(serialized.versions.length, 0);

    obj.setProperties({ [Constants.PROP_NAME.MEDIA_ID]: Math.random() });
    obj.addVersion('hi', 'ok', 8, 10);

    serialized = obj.serialize();

    assert.ok(serialized.uid);
    assert.ok(serialized.versions.length, 1);
  });
});
