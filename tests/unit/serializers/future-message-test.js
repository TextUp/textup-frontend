import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('future-message', 'Unit | Serializer | future message', {
  needs: [
    'model:contact',
    'model:media',
    'model:tag',
    'serializer:future-message',
    'validator:has-any',
    'validator:inclusion',
    'validator:length',
    'validator:number',
  ],
});

test('serialized form', function(assert) {
  const obj = this.subject();

  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.notOk(keys.includes('_repeatIntervalInDays'));
  assert.notOk(keys.includes('contact'));
  assert.notOk(keys.includes('hasEndDate'));
  assert.notOk(keys.includes('isDone'));
  assert.notOk(keys.includes('isRepeating'));
  assert.notOk(keys.includes('media'));
  assert.notOk(keys.includes('nextFireDate'));
  assert.notOk(keys.includes('tag'));
  assert.notOk(keys.includes('timesTriggered'));
  assert.notOk(keys.includes('whenCreated'));
  assert.ok(keys.includes('language'));
  assert.ok(keys.includes('message'));
  assert.ok(keys.includes('notifySelfOnSend'));
  assert.ok(keys.includes('startDate'));
  assert.ok(keys.includes('type'));
  assert.ok(keys.includes('doMediaActions'));
  // not repeating by default
  assert.notOk(keys.includes('repeatCount'));
  assert.notOk(keys.includes('repeatIntervalInDays'));
  assert.notOk(keys.includes('endDate'));

  obj.set('isRepeating', true);
  serialized = obj.serialize();
  keys = Object.keys(serialized);

  assert.ok(keys.includes('repeatCount'));
  assert.ok(keys.includes('repeatIntervalInDays'));
  assert.ok(keys.includes('endDate'));
});

test('serializing when repeating', function(assert) {
  run(() => {
    const obj = this.subject();
    obj.setProperties({
      isRepeating: true,
      repeatCount: 88,
      hasEndDate: true,
      endDate: new Date(),
    });

    let serialized = obj.serialize(),
      keys = Object.keys(serialized);

    assert.notOk(keys.includes('hasEndDate'));
    assert.notOk(keys.includes('isRepeating'));
    assert.ok(keys.includes('repeatCount'));
    assert.ok(keys.includes('repeatIntervalInDays'));
    assert.ok(keys.includes('endDate'));
    assert.notOk(serialized.repeatCount, 'repeat count is set to null when we have end date');
    assert.ok(serialized.endDate);

    obj.set('hasEndDate', false);
    serialized = obj.serialize();
    keys = Object.keys(serialized);

    assert.notOk(serialized.endDate, 'end date is set to null when we do not have end date');
    assert.ok(serialized.repeatCount);
  });
});
