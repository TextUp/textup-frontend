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

  assert.notOk(keys.contains('isActive'));
  assert.notOk(keys.contains('number'));
  assert.notOk(keys.contains('tags'));
  assert.notOk(keys.contains('awayMessageMaxLength'));
  assert.ok(keys.contains('allowSharingWithOtherTeams'));
  assert.ok(keys.contains('awayMessage'));
  assert.ok(keys.contains('language'));
  assert.ok(keys.contains('requestVoicemailGreetingCall'));
  assert.ok(keys.contains('useVoicemailRecordingIfPresent'));
  assert.ok(keys.contains('voice'));
  assert.ok(keys.contains('policies'));
});
