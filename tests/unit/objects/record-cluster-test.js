import { module, test } from 'qunit';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';

module('Unit | Object | record cluster');

test('properties', function(assert) {
  const rCluster = RecordCluster.create();

  assert.equal(rCluster.get('numItems'), 0);
  assert.deepEqual(rCluster.get('items'), []);

  rCluster.get('items').pushObject('ok');

  assert.equal(rCluster.get('numItems'), 1);
});
