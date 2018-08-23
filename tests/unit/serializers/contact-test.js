import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('contact', 'Unit | Serializer | contact', {
  needs: [
    'serializer:contact',
    'model:record-item',
    'model:record-text',
    'model:record-call',
    'model:record-note',
    'model:future-message',
    'model:phone',
    'model:tag',
    'model:shared-contact',
    'validator:presence',
    'validator:length',
    'validator:inclusion',
    'validator:collection'
  ]
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
  assert.notOk(keys.contains('permission'));
  assert.notOk(keys.contains('startedSharing'));
  assert.notOk(keys.contains('sharedBy'));
  assert.notOk(keys.contains('sharedById'));
  assert.notOk(keys.contains('lastRecordActivity'));
  assert.notOk(keys.contains('_recordItems'));
  assert.notOk(keys.contains('_futureMessages'));
  assert.notOk(keys.contains('futureMessages'));
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
      { action: 'delegate', bucketId: 123, itemId: 2 }
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
