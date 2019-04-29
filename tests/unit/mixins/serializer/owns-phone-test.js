import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import SerializerOwnsPhoneMixin from 'textup-frontend/mixins/serializer/owns-phone';
import { mockModel } from 'textup-frontend/tests/helpers/utilities';
import { moduleFor, test } from 'ember-qunit';

const { typeOf } = Ember;

moduleFor('mixin:serializer/owns-phone', 'Unit | Mixin | serializer/owns phone', {
  subject() {
    const BaseClass = Ember.Object.extend({ serialize: () => Object.create(null) });
    const SerializerOwnsPhoneObject = BaseClass.extend(SerializerOwnsPhoneMixin);
    return SerializerOwnsPhoneObject.create();
  },
});

test('attributes', function(assert) {
  const obj = this.subject();

  assert.equal(obj.attrs.phone.deserialize, 'records');
  assert.equal(obj.attrs.phone.serialize, 'records');
});

test('no phone action', function(assert) {
  const obj = this.subject();

  let json = obj.serialize({ record: Ember.Object.create() });

  assert.equal(typeOf(json), 'object');
  assert.deepEqual(json, Object.create(null));
});

test('changing phone number', function(assert) {
  const obj = this.subject(),
    sid = Math.random(),
    phoneNumber = Math.random();

  let json = obj.serialize({
    record: Ember.Object.create({ phoneAction: Constants.ACTION.PHONE.CHANGE_NUMBER }),
  });

  assert.equal(typeOf(json), 'object');
  assert.deepEqual(json.phone, { doPhoneActions: [Object.create(null)] });

  json = obj.serialize({
    record: Ember.Object.create({
      phoneAction: Constants.ACTION.PHONE.CHANGE_NUMBER,
      hasPhoneActionData: true,
      phoneActionData: { sid },
    }),
  });

  assert.equal(typeOf(json), 'object');
  assert.deepEqual(json.phone, { doPhoneActions: [{ action: 'NUMBYID', numberId: sid }] });

  json = obj.serialize({
    record: Ember.Object.create({
      phoneAction: Constants.ACTION.PHONE.CHANGE_NUMBER,
      hasPhoneActionData: true,
      phoneActionData: { phoneNumber },
    }),
  });

  assert.equal(typeOf(json), 'object');
  assert.deepEqual(json.phone, { doPhoneActions: [{ action: 'NUMBYNUM', number: phoneNumber }] });
});

test('deactivating phone', function(assert) {
  const obj = this.subject();

  let json = obj.serialize({
    record: Ember.Object.create({ phoneAction: Constants.ACTION.PHONE.DEACTIVATE }),
  });

  assert.equal(typeOf(json), 'object');
  assert.deepEqual(json.phone, { doPhoneActions: [{ action: 'DEACTIVATE' }] });
});

test('transfering phone', function(assert) {
  const obj = this.subject(),
    id = Math.random();

  let json = obj.serialize({
    record: Ember.Object.create({ phoneAction: Constants.ACTION.PHONE.TRANSFER }),
  });

  assert.equal(typeOf(json), 'object');
  assert.deepEqual(json.phone, {
    doPhoneActions: [{ action: 'TRANSFER', id: undefined, type: 'GROUP' }],
  });

  json = obj.serialize({
    record: Ember.Object.create({
      phoneAction: Constants.ACTION.PHONE.TRANSFER,
      hasPhoneActionData: true,
      phoneActionData: mockModel(id, Constants.MODEL.STAFF),
    }),
  });

  assert.equal(typeOf(json), 'object');
  assert.deepEqual(json.phone, {
    doPhoneActions: [{ action: 'TRANSFER', id, type: 'INDIVIDUAL' }],
  });
});
