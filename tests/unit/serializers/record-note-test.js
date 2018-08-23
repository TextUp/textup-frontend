import Ember from 'ember';
import { mockModel } from '../../helpers/utilities';
import { moduleForModel, test } from 'ember-qunit';

const { typeOf, isPresent, run } = Ember;

moduleForModel('record-note', 'Unit | Serializer | record note', {
  needs: [
    'service:constants',
    'serializer:record-note',
    'model:media',
    'model:contact',
    'model:tag',
    'model:location',
    'model:record-note-revision',
    'model:record-item',
    'transform:record-item-status',
    'validator:inclusion',
    'validator:presence',
    'validator:number',
    'validator:has-any'
  ]
});

test('serialized form', function(assert) {
  const obj = this.subject();
  let keys = Object.keys(obj.serialize());

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

test('serializing recipients', function(assert) {
  const constants = this.container.lookup('service:constants'),
    obj = this.subject();

  let serialized = obj.serialize();

  assert.notOk(isPresent(serialized.forContact));
  assert.notOk(isPresent(serialized.forSharedContact));
  assert.notOk(isPresent(serialized.forTag));

  const newContact1 = mockModel('1a', constants.MODEL.CONTACT),
    newContact2 = mockModel('1b', constants.MODEL.CONTACT),
    newTag1 = mockModel('2a', constants.MODEL.TAG),
    newTag2 = mockModel('2b', constants.MODEL.TAG),
    newShared1 = mockModel('3a', constants.MODEL.CONTACT, { isShared: true }),
    newShared2 = mockModel('3b', constants.MODEL.CONTACT, { isShared: true }),
    newNum1 = '111 asdfsa 222 asfo!@@ 33(((33   ';
  obj.addRecipient(newContact1);
  obj.addRecipient(newContact2);
  obj.addRecipient(newTag1);
  obj.addRecipient(newTag2);
  obj.addRecipient(newShared1);
  obj.addRecipient(newShared2);
  obj.addRecipient(newNum1);
  serialized = obj.serialize();

  assert.equal(typeOf(serialized.forContact), 'string');
  assert.equal(serialized.forContact, newContact1.get('id'));

  assert.equal(typeOf(serialized.forSharedContact), 'string');
  assert.equal(serialized.forSharedContact, newShared1.get('id'));

  assert.equal(typeOf(serialized.forTag), 'string');
  assert.equal(serialized.forTag, newTag1.get('id'));
});
