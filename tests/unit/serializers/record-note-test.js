import * as AliasModelNameInitializer from 'textup-frontend/initializers/alias-model-name';

import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { typeOf, run } = Ember;

moduleForModel('record-note', 'Unit | Serializer | record note', {
  needs: [
    'model:contact',
    'model:location',
    'model:media',
    'model:record-item',
    'model:record-note-revision',
    'model:tag',
    'serializer:record-note',
    'transform:record-item-status',
    'validator:has-any',
    'validator:inclusion',
    'validator:number',
    'validator:presence',
  ],
  beforeEach() {
    AliasModelNameInitializer.aliasModelName();
  },
  afterEach() {
    AliasModelNameInitializer.cleanUpModelNameAlias();
  },
});

test('serialized form', function(assert) {
  const obj = this.subject();
  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.ok(keys.contains('type'), 'type is converted back to backend format');
  assert.equal(serialized.type, 'NOTE');

  assert.notOk(keys.contains('whenChanged'));
  assert.notOk(keys.contains('isReadOnly'));
  assert.ok(keys.contains('location'));

  assert.notOk(keys.contains('hasBeenDeleted'));
  assert.ok(keys.contains('isDeleted'));

  assert.notOk(keys.contains('_revisions'));
  assert.notOk(keys.contains('revisions'));

  assert.ok(keys.contains('after'));
  assert.equal(obj.serialize().after, null);

  run(() => {
    const rItem = this.store().createRecord('record-item', { whenCreated: new Date() });
    obj.addAfter(rItem);

    keys = Object.keys(obj.serialize());

    assert.ok(keys.contains('after'));
    assert.equal(typeOf(obj.serialize().after), 'date');
  });
});
