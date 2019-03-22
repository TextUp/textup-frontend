import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import PhoneNumberUtils from 'textup-frontend/utils/phone-number';
import { mockModel } from 'textup-frontend/tests/helpers/utilities';
import { moduleForModel, test } from 'ember-qunit';
import { tryNormalizePolymorphicType } from 'textup-frontend/serializers/record-item';

const { run, isPresent, typeOf } = Ember;

moduleForModel('record-item', 'Unit | Serializer | record item', {
  needs: [
    'serializer:record-item',
    'model:media',
    'model:media/add',
    'model:media/remove',
    'model:media-element',
    'model:media-element-version',
    'model:contact',
    'model:tag',
    'transform:record-item-status',
  ],
});

test('serialized form', function(assert) {
  const obj = this.subject(),
    serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.ok(keys.contains('type'), 'type is converted back to backend format');
  assert.equal(serialized.type, undefined, 'record-items are not accepted by the backend');

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

  tryNormalizePolymorphicType(hash);
  assert.deepEqual(hash, {}, 'no change if no type');

  hash.type = 'invalid';
  tryNormalizePolymorphicType(hash);
  assert.deepEqual(hash.type, 'invalid', 'no change if type is invalid');

  hash.type = 'TEXT';
  tryNormalizePolymorphicType(hash);
  assert.deepEqual(hash.type, 'record-text');

  hash.type = 'CALL';
  tryNormalizePolymorphicType(hash);
  assert.deepEqual(hash.type, 'record-call');

  hash.type = 'NOTE';
  tryNormalizePolymorphicType(hash);
  assert.deepEqual(hash.type, 'record-note');
});

test('serializing recipients', function(assert) {
  const obj = this.subject();

  let serialized = obj.serialize();

  assert.notOk(isPresent(serialized.ids));
  assert.notOk(isPresent(serialized.numbers));

  const newContact1 = mockModel('1a', Constants.MODEL.CONTACT),
    newContact2 = mockModel('1b', Constants.MODEL.CONTACT),
    newTag1 = mockModel('2a', Constants.MODEL.TAG),
    newTag2 = mockModel('2b', Constants.MODEL.TAG),
    newShared1 = mockModel('3a', Constants.MODEL.CONTACT, { isShared: true }),
    newShared2 = mockModel('3b', Constants.MODEL.CONTACT, { isShared: true }),
    newNum1 = '111 asdfsa 222 asfo!@@ 33(((33   ';
  obj.addRecipient(newContact1);
  obj.addRecipient(newContact2);
  obj.addRecipient(newTag1);
  obj.addRecipient(newTag2);
  obj.addRecipient(newShared1);
  obj.addRecipient(newShared2);
  obj.addRecipient(newNum1);
  serialized = obj.serialize();

  assert.equal(typeOf(serialized.ids), 'array');
  assert.equal(serialized.ids.length, 6);
  assert.ok(serialized.ids.contains(newContact1.get('id')));
  assert.ok(serialized.ids.contains(newContact2.get('id')));
  assert.ok(serialized.ids.contains(newTag1.get('id')));
  assert.ok(serialized.ids.contains(newTag2.get('id')));
  assert.ok(serialized.ids.contains(newShared1.get('id')));
  assert.ok(serialized.ids.contains(newShared2.get('id')));

  assert.equal(typeOf(serialized.numbers), 'array');
  assert.deepEqual(serialized.numbers, [PhoneNumberUtils.clean(newNum1)]);
});
