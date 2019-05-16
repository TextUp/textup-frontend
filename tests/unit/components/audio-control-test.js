import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('audio-control', 'Unit | Component | audio control', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => {
    this.subject({
      showAddIfNone: 'bad',
      audio: 'bad',
      onAdd: 'bad',
      onRemove: 'bad',
      readOnly: 'bad',
    });
  }, TestUtils.ERROR_PROP_WRONG_TYPE);
});
