import { moduleForModel, test } from 'ember-qunit';

moduleForModel('record-note-revision', 'Unit | Serializer | record note revision', {
  // Specify the other units that are required for this test.
  needs: ['serializer:record-note-revision']
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
