import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('future-message', 'Unit | Serializer | future message', {
  needs: [
    'serializer:future-message',
    'model:media',
    'service:constants',
    'model:contact',
    'model:tag',
    'validator:inclusion',
    'validator:length',
    'validator:has-any',
    'validator:number'
  ]
});

test('serialized form', function(assert) {
  const obj = this.subject();

  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.notOk(keys.contains('_repeatIntervalInDays'));
  assert.notOk(keys.contains('contact'));
  assert.notOk(keys.contains('hasEndDate'));
  assert.notOk(keys.contains('isDone'));
  assert.notOk(keys.contains('isRepeating'));
  assert.notOk(keys.contains('media'));
  assert.notOk(keys.contains('nextFireDate'));
  assert.notOk(keys.contains('tag'));
  assert.notOk(keys.contains('timesTriggered'));
  assert.notOk(keys.contains('whenCreated'));
  assert.ok(keys.contains('language'));
  assert.ok(keys.contains('message'));
  assert.ok(keys.contains('notifySelf'));
  assert.ok(keys.contains('startDate'));
  assert.ok(keys.contains('type'));
  assert.ok(keys.contains('doMediaActions'));
  // not repeating by default
  assert.notOk(keys.contains('repeatCount'));
  assert.notOk(keys.contains('repeatIntervalInDays'));
  assert.notOk(keys.contains('endDate'));

  obj.set('isRepeating', true);
  serialized = obj.serialize();
  keys = Object.keys(serialized);

  assert.ok(keys.contains('repeatCount'));
  assert.ok(keys.contains('repeatIntervalInDays'));
  assert.ok(keys.contains('endDate'));
});

test('serializing when repeating', function(assert) {
  run(() => {
    const obj = this.subject();
    obj.setProperties({
      isRepeating: true,
      repeatCount: 88,
      hasEndDate: true,
      endDate: new Date()
    });

    let serialized = obj.serialize(),
      keys = Object.keys(serialized);

    assert.notOk(keys.contains('hasEndDate'));
    assert.notOk(keys.contains('isRepeating'));
    assert.ok(keys.contains('repeatCount'));
    assert.ok(keys.contains('repeatIntervalInDays'));
    assert.ok(keys.contains('endDate'));
    assert.notOk(serialized.repeatCount, 'repeat count is set to null when we have end date');
    assert.ok(serialized.endDate);

    obj.set('hasEndDate', false);
    serialized = obj.serialize();
    keys = Object.keys(serialized);

    assert.notOk(serialized.endDate, 'end date is set to null when we do not have end date');
    assert.ok(serialized.repeatCount);
  });
});
