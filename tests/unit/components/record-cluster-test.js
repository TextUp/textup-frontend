import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';

moduleForComponent('record-cluster', 'Unit | Component | record cluster', {
  unit: true,
});

test('invalid inputs', function(assert) {
  const cluster = RecordCluster.create();

  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING, 'requires cluster');

  assert.throws(
    () => this.subject({ cluster, callOptions: 'not an obj', noteOptions: 'not an obj' }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'if specified, options must be an object'
  );
});
