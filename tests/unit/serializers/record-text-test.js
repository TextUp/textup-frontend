import { moduleForModel, test } from 'ember-qunit';

moduleForModel('record-text', 'Unit | Serializer | record text', {
  needs: [
    'serializer:record-text',
    'model:media',
    'model:contact',
    'model:tag',
    'transform:record-item-status',
    'validator:number',
    'validator:has-any',
  ],
});

test('serialized form', function(assert) {
  const obj = this.subject(),
    serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.ok(keys.contains('type'), 'type is converted back to backend format');
  assert.equal(serialized.type, 'TEXT');

  assert.ok(keys.contains('contents'));
});
