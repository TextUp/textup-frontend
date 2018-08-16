import { moduleForModel, test } from 'ember-qunit';

moduleForModel('record-note-revision', 'Unit | Serializer | record note revision', {
  needs: ['serializer:record-note-revision', 'model:location', 'model:media']
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  const obj = this.subject(),
    serialized = obj.serialize();
  console.log('serialized', serialized);

  assert.ok(serialized);
});
