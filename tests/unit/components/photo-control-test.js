import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('photo-control', 'Unit | Component | photo control', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(
    () =>
      this.subject({
        images: [],
        addComponentClass: 88,
        onAdd: 'not a function',
        onRemove: 'not a function',
      }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'add and removing handlers must be functions'
  );

  assert.throws(
    () =>
      this.subject({
        images: [],
        imageDisplayComponent: 'not recognized value',
      }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'throws error when display is an invalid value'
  );
});
