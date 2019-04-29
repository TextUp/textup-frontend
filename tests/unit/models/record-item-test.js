import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import sinon from 'sinon';
import { mockModel } from '../../helpers/utilities';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('record-item', 'Unit | Model | record item', {
  needs: ['model:contact', 'model:tag', 'model:media'],
});

test('dirty checking', function(assert) {
  const obj = this.subject();

  assert.notOk(obj.get('hasManualChanges'), 'no media yet');

  obj.set('media', this.store().createRecord('media'));

  assert.ok(obj.get('hasManualChanges'), 'now has media obj that is dirty');

  obj.set('media', null);

  assert.notOk(obj.get('hasManualChanges'), 'no media yet');
});

test('rolling back changes', function(assert) {
  run(() => {
    const obj = this.subject(),
      newContact1 = mockModel('testing', Constants.MODEL.CONTACT),
      newShared1 = mockModel(null, Constants.MODEL.CONTACT, { isShared: true }),
      newTag1 = mockModel('ok', Constants.MODEL.TAG),
      newNumber1 = '111 asdfsa 222 asfo!@@ 33(((33   ',
      media = this.store().createRecord('media'),
      rollbackSpy = sinon.spy(media, 'rollbackAttributes');
    obj.set('media', media);

    assert.ok(obj.addRecipient(newContact1));
    assert.ok(obj.addRecipient(newShared1));
    assert.ok(obj.addRecipient(newTag1));
    assert.ok(obj.addRecipient(newNumber1));
    assert.equal(obj.get('numRecipients'), 4);

    obj.rollbackAttributes();

    assert.equal(obj.get('numRecipients'), 0);
    assert.deepEqual(obj.get('recipients'), []);
    assert.deepEqual(obj.get('newNumberRecipients'), []);
    assert.ok(rollbackSpy.calledOnce);
  });
});

test('default values', function(assert) {
  const obj = this.subject();

  assert.equal(
    obj.get('noteContents'),
    '',
    'note contents initialized to empty string to avoid being interpreted as the string "null"'
  );
});

test('adding and removing existing recipients', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('numRecipients'), 0);

  const newContact1 = mockModel('testing', Constants.MODEL.CONTACT);
  assert.ok(obj.addRecipient(newContact1), 'successfully added');
  assert.ok(obj.addRecipient(newContact1), 'successfully added');
  assert.equal(obj.get('numRecipients'), 1);
  assert.equal(obj.get('recipients').length, 1, 'avoid duplicates based on primary key');

  const newContact2 = mockModel(null, Constants.MODEL.CONTACT);
  assert.ok(obj.addRecipient(newContact2), 'successfully added');
  assert.ok(obj.addRecipient(newContact2), 'successfully added');
  assert.equal(obj.get('numRecipients'), 3);
  assert.equal(obj.get('recipients').length, 3, 'cannot check duplicates w/o primary key');

  const newTag1 = mockModel('ok', Constants.MODEL.TAG);
  assert.ok(obj.addRecipient(newTag1), 'successfully added');
  assert.ok(obj.addRecipient(newTag1), 'successfully added');
  assert.ok(obj.addRecipient(newTag1), 'successfully added');
  assert.equal(obj.get('numRecipients'), 4);
  assert.equal(obj.get('recipients').length, 4);
  assert.equal(obj.get('newNumberRecipients').length, 0);

  assert.ok(
    obj.addRecipient(mockModel(null, Constants.MODEL.CONTACT, { isShared: true })),
    'successfully added'
  );
  assert.equal(obj.get('numRecipients'), 5);
  assert.equal(obj.get('recipients').length, 5);
  assert.equal(obj.get('newNumberRecipients').length, 0);

  assert.ok(obj.removeRecipient(newContact1));
  assert.ok(obj.removeRecipient(newTag1));
  assert.notOk(obj.removeRecipient('i am not found so i am ignored'));
  assert.notOk(obj.removeRecipient());
  assert.notOk(obj.removeRecipient([]));
  assert.notOk(obj.removeRecipient(null));
  assert.equal(obj.get('numRecipients'), 3, 'remove recipients with matching ids, if found');
  assert.equal(obj.get('recipients').length, 3);
  assert.equal(obj.get('newNumberRecipients').length, 0);

  obj.removeRecipient(newContact2);
  assert.equal(
    obj.get('numRecipients'),
    1,
    'if no id provided, remove all recipients with similarly missing ids'
  );
  assert.equal(obj.get('recipients').length, 1);
  assert.equal(obj.get('newNumberRecipients').length, 0);
});

test('test adding and removing new recipients (phone numbers)', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('numRecipients'), 0);

  assert.notOk(obj.addRecipient());
  assert.notOk(obj.addRecipient(null));
  assert.notOk(obj.addRecipient('sdfasd'), 'string is not a valid phone number');
  assert.notOk(obj.addRecipient([]), 'cannot add a list');

  assert.equal(obj.get('numRecipients'), 0);

  assert.ok(
    obj.addRecipient('111 asdfsa 222 asfo!@@ 33(((33   '),
    'is a valid phone number after cleaning'
  );
  assert.equal(obj.get('numRecipients'), 1);
  assert.equal(obj.get('recipients').length, 0);
  assert.equal(obj.get('newNumberRecipients').length, 1);
  assert.equal(obj.get('newNumberRecipients.firstObject'), '1112223333');

  assert.notOk(obj.removeRecipient());
  assert.notOk(obj.removeRecipient(null));
  assert.notOk(obj.removeRecipient('i am not found so I am ignored'));
  assert.equal(obj.get('numRecipients'), 1, 'not found in new numbers so is ignored');
  assert.equal(obj.get('recipients').length, 0);
  assert.equal(obj.get('newNumberRecipients').length, 1);

  assert.ok(obj.removeRecipient('11122233kdfj33  asdf'), 'removing also cleans');
  assert.equal(obj.get('recipients').length, 0);
  assert.equal(obj.get('newNumberRecipients').length, 0);
});
