import { moduleForModel, test } from 'ember-qunit';

moduleForModel('organization', 'Unit | Serializer | organization', {
  needs: [
    'model:location',
    'model:team',
    'serializer:organization',
    'validator:belongs-to',
    'validator:length',
    'validator:number',
    'validator:presence',
  ],
});

test('serialized form', function(assert) {
  const obj = this.subject();

  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.notOk(keys.contains('numAdmins'));
  assert.notOk(keys.contains('teams'));
  assert.notOk(keys.contains('timeoutMin'));
  assert.notOk(keys.contains('timeoutMax'));
  assert.notOk(keys.contains('awayMessageSuffixMaxLength'));
  assert.ok(keys.contains('name'));
  assert.ok(keys.contains('location'));
  assert.ok(keys.contains('status'));
  assert.ok(keys.contains('timeout'));
  assert.ok(keys.contains('awayMessageSuffix'));
});
