import { typeOf } from '@ember/utils';
import { run } from '@ember/runloop';
import * as AliasModelNameInitializer from 'textup-frontend/initializers/alias-model-name';

import { moduleForModel, test } from 'ember-qunit';

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

  assert.ok(keys.includes('type'), 'type is converted back to backend format');
  assert.equal(serialized.type, 'NOTE');

  assert.notOk(keys.includes('whenChanged'));
  assert.notOk(keys.includes('isReadOnly'));
  assert.ok(keys.includes('location'));

  assert.notOk(keys.includes('hasBeenDeleted'));
  assert.ok(keys.includes('isDeleted'));

  assert.notOk(keys.includes('_revisions'));
  assert.notOk(keys.includes('revisions'));

  assert.ok(keys.includes('after'));
  assert.equal(obj.serialize().after, null);

  run(() => {
    const rItem = this.store().createRecord('record-item', { whenCreated: new Date() });
    obj.addAfter(rItem);

    keys = Object.keys(obj.serialize());

    assert.ok(keys.includes('after'));
    assert.equal(typeOf(obj.serialize().after), 'date');
  });
});
