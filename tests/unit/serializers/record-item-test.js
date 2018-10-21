import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run, typeOf } = Ember;

moduleForModel('record-item', 'Unit | Serializer | record item', {
  needs: [
    'service:constants',
    'serializer:record-item',
    'model:media',
    'model:media/add',
    'model:media/remove',
    'model:media-element',
    'model:media-element-version',
    'model:contact',
    'model:tag',
    'transform:record-item-status'
  ]
});

test('serialized form', function(assert) {
  const obj = this.subject(),
    keys = Object.keys(obj.serialize());

  assert.notOk(keys.contains('whenCreated'), 'no whenCreated');
  assert.notOk(keys.contains('outgoing'), 'no outgoing');
  assert.notOk(keys.contains('hasAwayMessage'), 'no hasAwayMessage');
  assert.notOk(keys.contains('receipts'), 'no receipts');
  assert.notOk(keys.contains('media'), 'no media');
  assert.notOk(keys.contains('contact'), 'no contact');
  assert.notOk(keys.contains('tag'), 'no tag');
});

test('serializing with media actions', function(assert) {
  run(() => {
    const obj = this.subject(),
      media = this.store().createRecord('media');
    obj.set('media', media);

    let serialized = obj.serialize();

    assert.notOk(Ember.isPresent(serialized.doMediaActions), 'no media actions');

    media.addImage('mimeType', 'data', 88, 99);
    media.removeElement('id to remove');
    serialized = obj.serialize();

    assert.equal(typeOf(serialized.doMediaActions), 'array');
    assert.equal(serialized.doMediaActions.length, 2);
  });
});

test('getting model name from payload', function(assert) {
  const serializer = Ember.getOwner(this).lookup('serializer:record-item');

  assert.equal(serializer.modelNameFromPayloadKey('records'), 'record-item');
  assert.equal(serializer.modelNameFromPayloadKey('record'), 'record-item');
  assert.equal(
    serializer.modelNameFromPayloadKey('blah'),
    'blah',
    'unrecognized payload keys pass through unchanged'
  );
});

test('normalizing polyorphic types', function(assert) {
  const serializer = Ember.getOwner(this).lookup('serializer:record-item'),
    hash = {};

  serializer._tryNormalizePolymorphicType(hash);
  assert.deepEqual(hash, {}, 'no change if no type');

  hash.type = 'invalid';
  serializer._tryNormalizePolymorphicType(hash);
  assert.deepEqual(hash.type, 'invalid', 'no change if type is invalid');

  hash.type = 'TEXT';
  serializer._tryNormalizePolymorphicType(hash);
  assert.deepEqual(hash.type, 'record-text');

  hash.type = 'CALL';
  serializer._tryNormalizePolymorphicType(hash);
  assert.deepEqual(hash.type, 'record-call');

  hash.type = 'NOTE';
  serializer._tryNormalizePolymorphicType(hash);
  assert.deepEqual(hash.type, 'record-note');
});
