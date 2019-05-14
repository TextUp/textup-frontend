import Ember from 'ember';
import OwnsPhoneSerializer from 'textup-frontend/mixins/serializer/owns-phone';
import StaffSerializer from 'textup-frontend/serializers/staff';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('staff', 'Unit | Serializer | staff', {
  needs: [
    'model:location',
    'model:organization',
    'model:phone',
    'model:schedule',
    'model:team',
    'serializer:staff',
    'service:auth-service',
    'transform:phone-number',
    'validator:belongs-to',
    'validator:format',
    'validator:inclusion',
    'validator:length',
    'validator:number',
    'validator:presence',
  ],
});

test('serializer owns phone', function(assert) {
  const serializer = StaffSerializer.create();

  assert.ok(OwnsPhoneSerializer.detect(serializer));
});

test('serialized form', function(assert) {
  const obj = this.subject();

  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.notOk(keys.includes('teams'));
  assert.ok(keys.includes('username'));
  assert.ok(keys.includes('name'));
  assert.ok(keys.includes('email'));
  assert.ok(keys.includes('org'));
  assert.ok(keys.includes('personalNumber'));
  assert.ok(keys.includes('status'));
  assert.ok(
    keys.includes('shouldAddToGeneralUpdatesList'),
    'for opting in to updates list on creation'
  );
});

test('serializing password and lock code', function(assert) {
  const obj = this.subject();

  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  // if lock and password do not have values (that is, they do not need to be updated),
  // then delete these two keys
  assert.notOk(keys.includes('password'));
  assert.notOk(keys.includes('lockCode'));

  run(() => obj.setProperties({ password: 'hi', lockCode: 'hi' }));

  serialized = obj.serialize();
  keys = Object.keys(serialized);

  // if password and lock code need to be updated, then ensure that these are present
  assert.ok(keys.includes('password'));
  assert.ok(keys.includes('lockCode'));
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
