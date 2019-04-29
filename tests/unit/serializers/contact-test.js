import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

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

  assert.notOk(keys.contains('numbers'));
  assert.notOk(keys.contains('phone'));
  assert.notOk(keys.contains('unreadInfo'));
  assert.notOk(keys.contains('tags'));
  assert.notOk(keys.contains('sharedWith'));
  assert.notOk(keys.contains('startedSharing'));
  assert.notOk(keys.contains('sharedByName'));
  assert.notOk(keys.contains('sharedByPhoneId'));
  assert.notOk(keys.contains('lastRecordActivity'));
  assert.notOk(keys.contains('_recordItems'));
  assert.notOk(keys.contains('_futureMessages'));
  assert.notOk(keys.contains('futureMessages'));
  assert.ok(keys.contains('permission'));
  assert.ok(keys.contains('language'));
  assert.ok(keys.contains('name'));
  assert.ok(keys.contains('note'));
  assert.ok(keys.contains('status'));
  assert.notOk(keys.contains('doNumberActions'), 'no number actions if no numbers changed');
  assert.notOk(keys.contains('doShareActions'), 'no sharing actions key if none specified');

  run(() => {
    obj.set('numbers', ['111 222 3333']);
    serialized = obj.serialize();
    keys = Object.keys(serialized);

    assert.ok(keys.contains('doNumberActions'), 'number actions specified');

    obj.set('actions', [
      { action: 'stop', bucketId: 88, itemId: 2 },
      { action: 'delegate', bucketId: 123, itemId: 2 },
    ]);
    serialized = obj.serialize();
    keys = Object.keys(serialized);

    assert.ok(keys.contains('doShareActions'), 'sharing actions specified');
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
