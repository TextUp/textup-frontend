import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('responsive-image', 'Unit | Component | responsive image', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(
    () => this.subject({ versions: [{ test: 'required source prop not provided' }] }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'when provided, objects in versions list must conform to spec'
  );
});
