import { moduleForModel, test } from 'ember-qunit';

moduleForModel('owner-policy', 'Unit | Serializer | owner policy', {
  needs: ['serializer:owner-policy', 'model:schedule', 'transform:fragment'],
});

test('serializes', function(assert) {
  let record = this.subject();
  let serializedRecord = record.serialize(),
    keys = Object.keys(serializedRecord);

  assert.notOk(keys.contains('staffId'));
  assert.notOk(keys.contains('name'));
});
