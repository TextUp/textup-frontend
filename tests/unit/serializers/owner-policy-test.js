import { moduleForModel, test } from 'ember-qunit';

moduleForModel('owner-policy', 'Unit | Serializer | owner policy', {
  needs: ['serializer:owner-policy', 'model:schedule', 'transform:fragment'],
});

test('serializes', function(assert) {
  let record = this.subject();
  let serializedRecord = record.serialize(),
    keys = Object.keys(serializedRecord);

  assert.ok(
    keys.contains('staffId'),
    'needs staff id to be able to identify who this policy belongs to'
  );
  assert.notOk(keys.contains('name'));
});
