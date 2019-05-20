import { run } from '@ember/runloop';
import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('record-cluster/item', 'Unit | Component | record cluster/item', {
  unit: true,
  needs: ['model:record-item', 'model:media', 'model:contact', 'model:tag'],
  beforeEach() {
    this.inject.service('store');
  },
});

test('invalid inputs', function(assert) {
  const rItem1 = run(() => this.store.createRecord('record-item'));

  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING, 'requires item or subclass');

  assert.throws(
    () => this.subject({ item: rItem1, callOptions: 'not an obj', noteOptions: 'not an obj' }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'if specified, options must be an object'
  );
});
