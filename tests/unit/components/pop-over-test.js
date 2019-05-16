import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('pop-over', 'Unit | Component | pop over', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(
    () =>
      this.subject({
        doRegister: 88,
        onOpen: 88,
        onClose: 88,
        onReposition: 88,
        bodyClickWillClose: 88,
        position: 88,
      }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
