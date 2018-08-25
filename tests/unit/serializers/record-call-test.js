import Ember from 'ember';
import { mockModel } from '../../helpers/utilities';
import { moduleForModel, test } from 'ember-qunit';

const { typeOf } = Ember;

moduleForModel('record-call', 'Unit | Serializer | record call', {
  needs: [
    'service:constants',
    'serializer:record-call',
    'model:media',
    'model:contact',
    'model:tag',
    'transform:record-item-status',
    'validator:inclusion',
    'validator:has-any'
  ]
});

test('serialized form', function(assert) {
  const obj = this.subject(),
    keys = Object.keys(obj.serialize());

  assert.notOk(keys.contains('durationInSeconds'));
  assert.notOk(keys.contains('hasVoicemail'));
  assert.notOk(keys.contains('voicemailUrl'));
  assert.notOk(keys.contains('voicemailInSeconds'));
});

test('serializing recipients', function(assert) {
  const constants = Ember.getOwner(this).lookup('service:constants'),
    obj = this.subject();

  let serialized = obj.serialize();

  assert.notOk(serialized.callContact);
  assert.notOk(serialized.callSharedContact);

  const newContact1 = mockModel('contact1', constants.MODEL.CONTACT),
    newContact2 = mockModel('contact2', constants.MODEL.CONTACT),
    newTag1 = mockModel('2', constants.MODEL.TAG),
    newShared1 = mockModel('shared1', constants.MODEL.CONTACT, { isShared: true }),
    newShared2 = mockModel('shared2', constants.MODEL.CONTACT, { isShared: true }),
    newNum1 = '111 asdfsa 222 asfo!@@ 33(((33   ';
  obj.addRecipient(newContact1);
  obj.addRecipient(newContact2);
  obj.addRecipient(newTag1);
  obj.addRecipient(newShared1);
  obj.addRecipient(newShared2);
  obj.addRecipient(newNum1);
  serialized = obj.serialize();

  assert.equal(typeOf(serialized.callContact), 'string', 'only take the first id if multiple');
  assert.equal(serialized.callContact, newContact1.get('id'));

  assert.equal(
    typeOf(serialized.callSharedContact),
    'string',
    'only take the first id if multiple'
  );
  assert.equal(serialized.callSharedContact, newShared1.get('id'));
});
