import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('schedule-control', 'Unit | Component | schedule control', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING, 'requires schedule');
});
