import { moduleForModel, test } from 'ember-qunit';

moduleForModel('phone', 'Unit | Serializer | phone', {
  needs: [
    'model:media',
    'model:owner-policy',
    'model:tag',
    'serializer:phone',
    'transform:fragment-array',
    'validator:length',
  ],
});

test('serialized form', function(assert) {
  const obj = this.subject();
  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.notOk(keys.includes('isActive'));
  assert.notOk(keys.includes('number'));
  assert.notOk(keys.includes('tags'));
  assert.notOk(keys.includes('awayMessageMaxLength'));
  assert.ok(keys.includes('allowSharingWithOtherTeams'));
  assert.ok(keys.includes('awayMessage'));
  assert.ok(keys.includes('language'));
  assert.ok(keys.includes('requestVoicemailGreetingCall'));
  assert.ok(keys.includes('useVoicemailRecordingIfPresent'));
  assert.ok(keys.includes('voice'));
  assert.ok(keys.includes('policies'));
});
