import Ember from 'ember';
import SerializerOwnsPhoneMixin from 'textup-frontend/mixins/serializer/owns-phone';
import { moduleFor, test } from 'ember-qunit';

const { typeOf } = Ember;

moduleFor('mixin:serializer/owns-phone', 'Unit | Mixin | serializer/owns phone', {
  needs: ['service:constants'],
  beforeEach() {
    this.inject.service('constants');
  },
  subject() {
    const BaseClass = Ember.Object.extend({ serialize: () => Object.create(null) });
    const SerializerOwnsPhoneObject = BaseClass.extend(SerializerOwnsPhoneMixin, {
      constants: this.constants
    });
    return SerializerOwnsPhoneObject.create();
  }
});

test('attributes', function(assert) {
  const obj = this.subject();

  assert.equal(obj.attrs.hasInactivePhone.serialize, false);
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
    record: Ember.Object.create({ phoneAction: this.constants.PHONE.ACTION.CHANGE_NUMBER })
  });

  assert.equal(typeOf(json), 'object');
  assert.deepEqual(json.phone, { doPhoneActions: [Object.create(null)] });

  json = obj.serialize({
    record: Ember.Object.create({
      phoneAction: this.constants.PHONE.ACTION.CHANGE_NUMBER,
      hasPhoneActionData: true,
      phoneActionData: { sid }
    })
  });

  assert.equal(typeOf(json), 'object');
  assert.deepEqual(json.phone, { doPhoneActions: [{ action: 'NUMBYID', numberId: sid }] });

  json = obj.serialize({
    record: Ember.Object.create({
      phoneAction: this.constants.PHONE.ACTION.CHANGE_NUMBER,
      hasPhoneActionData: true,
      phoneActionData: { phoneNumber }
    })
  });

  assert.equal(typeOf(json), 'object');
  assert.deepEqual(json.phone, { doPhoneActions: [{ action: 'NUMBYNUM', number: phoneNumber }] });
});

test('deactivating phone', function(assert) {
  const obj = this.subject(),
    sid = Math.random(),
    phoneNumber = Math.random();

  let json = obj.serialize({
    record: Ember.Object.create({ phoneAction: this.constants.PHONE.ACTION.DEACTIVATE })
  });

  assert.equal(typeOf(json), 'object');
  assert.deepEqual(json.phone, { doPhoneActions: [{ action: 'DEACTIVATE' }] });
});

test('transfering phone', function(assert) {
  const obj = this.subject(),
    id = Math.random();

  let json = obj.serialize({
    record: Ember.Object.create({ phoneAction: this.constants.PHONE.ACTION.TRANSFER })
  });

  assert.equal(typeOf(json), 'object');
  assert.deepEqual(json.phone, {
    doPhoneActions: [{ action: 'TRANSFER', id: undefined, type: 'GROUP' }]
  });

  json = obj.serialize({
    record: Ember.Object.create({
      phoneAction: this.constants.PHONE.ACTION.TRANSFER,
      hasPhoneActionData: true,
      phoneActionData: { id, type: this.constants.MODEL.STAFF }
    })
  });

  assert.equal(typeOf(json), 'object');
  assert.deepEqual(json.phone, {
    doPhoneActions: [{ action: 'TRANSFER', id, type: 'INDIVIDUAL' }]
  });
});
