import Ember from 'ember';
import OwnsPhoneSerializer from 'textup-frontend/mixins/serializer/owns-phone';
import StaffSerializer from 'textup-frontend/serializers/staff';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('staff', 'Unit | Serializer | staff', {
  needs: [
    'serializer:staff',
    'service:constants',
    'service:auth-service',
    'validator:belongs-to',
    'validator:format',
    'validator:length',
    'validator:presence',
    'validator:number',
    'validator:inclusion',
    'model:team',
    'model:organization',
    'model:location',
    'model:schedule',
    'model:phone',
    'transform:phone-number'
  ]
});

test('serializer owns phone', function(assert) {
  const serializer = StaffSerializer.create();

  assert.ok(OwnsPhoneSerializer.detect(serializer));
});

test('serialized form', function(assert) {
  const obj = this.subject();

  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.notOk(keys.contains('teams'));
  assert.ok(keys.contains('username'));
  assert.ok(keys.contains('name'));
  assert.ok(keys.contains('captcha'));
  assert.ok(keys.contains('email'));
  assert.ok(keys.contains('org'));
  assert.ok(keys.contains('schedule'));
  assert.ok(keys.contains('manualSchedule'));
  assert.ok(keys.contains('isAvailable'));
  assert.ok(keys.contains('personalPhoneNumber'));
  assert.ok(keys.contains('status'));
});

test('serializing password and lock code', function(assert) {
  const obj = this.subject();

  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  // if lock and password do not have values (that is, they do not need to be updated),
  // then delete these two keys
  assert.notOk(keys.contains('password'));
  assert.notOk(keys.contains('lockCode'));

  run(() => obj.setProperties({ password: 'hi', lockCode: 'hi' }));

  serialized = obj.serialize();
  keys = Object.keys(serialized);

  // if password and lock code need to be updated, then ensure that these are present
  assert.ok(keys.contains('password'));
  assert.ok(keys.contains('lockCode'));
});

test('serializing organization', function(assert) {
  run(() => {
    const staff1 = this.subject(),
      orgId = Math.random(),
      org1 = this.store().createRecord('organization');
    org1.set('id', orgId);
    staff1.set('org', org1);

    let serialized = staff1.serialize();

    assert.deepEqual(serialized.org, { id: orgId });
  });
});
