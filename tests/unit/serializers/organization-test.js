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

  assert.notOk(keys.includes('numAdmins'));
  assert.notOk(keys.includes('teams'));
  assert.notOk(keys.includes('timeoutMin'));
  assert.notOk(keys.includes('timeoutMax'));
  assert.notOk(keys.includes('awayMessageSuffixMaxLength'));
  assert.ok(keys.includes('name'));
  assert.ok(keys.includes('location'));
  assert.ok(keys.includes('status'));
  assert.ok(keys.includes('timeout'));
  assert.ok(keys.includes('awayMessageSuffix'));
});
