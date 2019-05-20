import { run } from '@ember/runloop';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('contact', 'Unit | Serializer | contact', {
  needs: [
    'model:future-message',
    'model:phone',
    'model:record-call',
    'model:record-item',
    'model:record-note',
    'model:record-text',
    'model:contact/share-info',
    'model:tag',
    'serializer:contact',
    'transform:fragment-array',
    'validator:collection',
    'validator:inclusion',
    'validator:length',
    'validator:presence',
  ],
});

test('serialized form', function(assert) {
  const obj = this.subject();

  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.notOk(keys.includes('numbers'));
  assert.notOk(keys.includes('phone'));
  assert.notOk(keys.includes('unreadInfo'));
  assert.notOk(keys.includes('tags'));
  assert.notOk(keys.includes('sharedWith'));
  assert.notOk(keys.includes('startedSharing'));
  assert.notOk(keys.includes('sharedByName'));
  assert.notOk(keys.includes('sharedByPhoneId'));
  assert.notOk(keys.includes('lastRecordActivity'));
  assert.notOk(keys.includes('_recordItems'));
  assert.notOk(keys.includes('_futureMessages'));
  assert.notOk(keys.includes('futureMessages'));
  assert.ok(keys.includes('permission'));
  assert.ok(keys.includes('language'));
  assert.ok(keys.includes('name'));
  assert.ok(keys.includes('note'));
  assert.ok(keys.includes('status'));
  assert.notOk(keys.includes('doNumberActions'), 'no number actions if no numbers changed');
  assert.notOk(keys.includes('doShareActions'), 'no sharing actions key if none specified');

  run(() => {
    obj.set('numbers', ['111 222 3333']);
    serialized = obj.serialize();
    keys = Object.keys(serialized);

    assert.ok(keys.includes('doNumberActions'), 'number actions specified');

    obj.set('actions', [
      { action: 'stop', bucketId: 88, itemId: 2 },
      { action: 'delegate', bucketId: 123, itemId: 2 },
    ]);
    serialized = obj.serialize();
    keys = Object.keys(serialized);

    assert.ok(keys.includes('doShareActions'), 'sharing actions specified');
    assert.ok(serialized.doShareActions.every(shareObj => !shareObj.bucketId), 'no bucket id');
    assert.ok(serialized.doShareActions.every(shareObj => !shareObj.itemId), 'no item id');
    assert.ok(serialized.doShareActions.every(shareObj => !!shareObj.action), 'has action key');
    assert.ok(serialized.doShareActions.every(shareObj => !!shareObj.id), 'has id key');
  });
});

test('serializing view-only shared contact', function(assert) {
  const status = Math.random(),
    obj = this.subject();
  run(() => {
    obj.set('isViewPermission', true);
    obj.set('status', status);
  });

  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.equal(keys.length, 1, 'only serialize status if view-only shared contact');
  assert.equal(serialized.status, status);
});
