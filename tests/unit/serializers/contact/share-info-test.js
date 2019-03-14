import { moduleForModel, test } from 'ember-qunit';

moduleForModel('contact/share-info', 'Unit | Serializer | contact/share info', {
  // Specify the other units that are required for this test.
  needs: ['serializer:contact/share-info']
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
