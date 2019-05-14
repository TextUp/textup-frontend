import { moduleForModel, test } from 'ember-qunit';

moduleForModel('tag', 'Unit | Serializer | tag', {
  needs: [
    'model:future-message',
    'model:phone',
    'model:record-call',
    'model:record-item',
    'model:record-note',
    'model:record-text',
    'serializer:tag',
    'validator:presence',
  ],
});

test('serialized form', function(assert) {
  const obj = this.subject();

  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.ok(keys.includes('name'));
  assert.ok(keys.includes('hexColor'));
  assert.notOk(keys.includes('phone'));
  assert.notOk(keys.includes('numMembers'));
  assert.notOk(keys.includes('lastRecordActivity'));
  assert.notOk(keys.includes('_recordItems'));
  assert.notOk(keys.includes('_futureMessages'));
  assert.notOk(keys.includes('futureMessages'));
  assert.notOk(keys.includes('doTagActions'), 'no tag actions key if none specified');

  obj.set('actions', [{ itemId: 1, bucketId: 2 }]);
  serialized = obj.serialize();
  keys = Object.keys(serialized);

  assert.ok(keys.includes('doTagActions'), 'tag membership actions specified');
  assert.ok(serialized.doTagActions.every(tagObj => !tagObj.bucketId), 'no bucket id');
  assert.ok(serialized.doTagActions.every(tagObj => !tagObj.itemId), 'no item id');
  assert.ok(serialized.doTagActions.every(tagObj => !!tagObj.id), 'has id key');
});
