import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('hide-show', 'Unit | Component | hide show', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => {
    this.subject({
      doRegister: 'hi',
      onOpen: 88,
      onClose: 88,
      focusOnOpenSelector: 88,
      startOpen: 88,
      clickOutToClose: 88,
      ignoreCloseSelector: 88,
      focusOutToClose: 88,
      animate: 88,
      disabled: 88,
    });
  }, TestUtils.ERROR_PROP_WRONG_TYPE);
});
