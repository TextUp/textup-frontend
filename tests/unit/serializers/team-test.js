import OwnsPhoneSerializer from 'textup-frontend/mixins/serializer/owns-phone';
import TeamSerializer from 'textup-frontend/serializers/team';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('team', 'Unit | Serializer | team', {
  needs: [
    'model:location',
    'model:organization',
    'model:phone',
    'model:team',
    'serializer:team',
    'service:admin-service',
    'service:data-service',
    'validator:belongs-to',
    'validator:inclusion',
    'validator:number',
    'validator:presence',
  ],
});

test('serializer owns phone', function(assert) {
  const serializer = TeamSerializer.create();

  assert.ok(OwnsPhoneSerializer.detect(serializer));
});

test('serialized form', function(assert) {
  const adminService = Ember.getOwner(this).lookup('service:admin-service'),
    sId = Math.random(),
    obj = this.subject();
  adminService.setEditingStaff(sId);

  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.equal(serialized.staffId, sId);

  assert.notOk(keys.contains('numMembers'));
  assert.ok(keys.contains('name'));
  assert.ok(keys.contains('hexColor'));
  assert.ok(keys.contains('org'));
  assert.ok(keys.contains('location'));
});

test('serializing team actions', function(assert) {
  const obj = this.subject(),
    itemId = Math.random(),
    bucketId = Math.random(),
    otherProp = Math.random();

  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.ok(keys.contains('doTeamActions'));
  assert.deepEqual(serialized.doTeamActions, []);

  obj.set('actions', [null]);

  serialized = obj.serialize();
  keys = Object.keys(serialized);

  assert.ok(keys.contains('doTeamActions'));
  assert.deepEqual(serialized.doTeamActions, [null]);

  obj.set('actions', [{ itemId, bucketId, otherProp }]);

  serialized = obj.serialize();
  keys = Object.keys(serialized);

  assert.ok(keys.contains('doTeamActions'));
  assert.deepEqual(serialized.doTeamActions, [{ id: itemId, otherProp }]);
});
