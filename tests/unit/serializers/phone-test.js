import { moduleForModel, test } from 'ember-qunit';

moduleForModel('phone', 'Unit | Serializer | phone', {
  needs: [
    'serializer:phone',
    'service:constants',
    'model:tag',
    'model:media',
    'model:availability',
    'validator:length'
  ]
});

test('serialized form', function(assert) {
  const obj = this.subject();

  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.notOk(keys.contains('number'));
  assert.notOk(keys.contains('tags'));
  assert.notOk(keys.contains('others'));
  assert.notOk(keys.contains('awayMessageMaxLength'));
  assert.ok(keys.contains('availability'));
  assert.ok(keys.contains('voice'));
  assert.ok(keys.contains('language'));
  assert.ok(keys.contains('requestVoicemailGreetingCall'));
  assert.ok(keys.contains('useVoicemailRecordingIfPresent'));
  assert.ok(keys.contains('awayMessage'));
});
