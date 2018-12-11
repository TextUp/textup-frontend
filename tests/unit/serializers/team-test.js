import OwnsPhoneSerializer from 'textup-frontend/mixins/serializer/owns-phone';
import TeamSerializer from 'textup-frontend/serializers/team';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('team', 'Unit | Serializer | team', {
  needs: [
    'serializer:team',
    'service:constants',
    'validator:belongs-to',
    'validator:presence',
    'validator:number',
    'validator:inclusion',
    'model:team',
    'model:organization',
    'model:location',
    'model:phone'
  ]
});

test('serializer owns phone', function(assert) {
  const serializer = TeamSerializer.create();

  assert.ok(OwnsPhoneSerializer.detect(serializer));
});

test('serialized form', function(assert) {
  const obj = this.subject();

  let serialized = obj.serialize(),
    keys = Object.keys(serialized);

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
