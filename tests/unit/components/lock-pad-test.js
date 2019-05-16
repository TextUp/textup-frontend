import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('lock-pad', 'Unit | Component | lock pad', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING, '`doUpdateVal` is required');
});
