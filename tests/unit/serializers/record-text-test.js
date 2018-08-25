import Ember from 'ember';
import { mockModel } from '../../helpers/utilities';
import { moduleForModel, test } from 'ember-qunit';

const { isPresent } = Ember;

moduleForModel('record-text', 'Unit | Serializer | record text', {
  needs: [
    'service:constants',
    'serializer:record-text',
    'model:media',
    'model:contact',
    'model:tag',
    'transform:record-item-status',
    'validator:number',
    'validator:has-any'
  ]
});

test('serialized form', function(assert) {
  const obj = this.subject(),
    keys = Object.keys(obj.serialize());

  assert.ok(keys.contains('contents'));
});

test('serializing recipients', function(assert) {
  const constants = Ember.getOwner(this).lookup('service:constants'),
    obj = this.subject();

  let serialized = obj.serialize();

  assert.notOk(isPresent(serialized.sendToContacts));
  assert.notOk(isPresent(serialized.sendToSharedContacts));
  assert.notOk(isPresent(serialized.sendToTags));
  assert.notOk(isPresent(serialized.sendToPhoneNumbers));

  const newContact1 = mockModel('1', constants.MODEL.CONTACT),
    newTag1 = mockModel('2', constants.MODEL.TAG),
    newShared1 = mockModel('3', constants.MODEL.CONTACT, { isShared: true }),
    newNum1 = '111 asdfsa 222 asfo!@@ 33(((33   ';
  obj.addRecipient(newContact1);
  obj.addRecipient(newTag1);
  obj.addRecipient(newShared1);
  obj.addRecipient(newNum1);
  serialized = obj.serialize();

  assert.equal(serialized.sendToContacts.length, 1);
  assert.equal(serialized.sendToContacts.objectAt(0), newContact1.get('id'));

  assert.equal(serialized.sendToSharedContacts.length, 1);
  assert.equal(serialized.sendToSharedContacts.objectAt(0), newShared1.get('id'));

  assert.equal(serialized.sendToTags.length, 1);
  assert.equal(serialized.sendToTags.objectAt(0), newTag1.get('id'));

  assert.equal(serialized.sendToPhoneNumbers.length, 1);
  assert.equal(serialized.sendToPhoneNumbers.objectAt(0), '1112223333');
});
