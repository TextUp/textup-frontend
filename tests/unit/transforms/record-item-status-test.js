import { moduleFor, test } from 'ember-qunit';

moduleFor('transform:record-item-status', 'Unit | Transform | record item status');

test('deserialize (api -> app)', function(assert) {
  const obj = this.subject(),
    emptyVal = {
      success: [],
      pending: [],
      busy: [],
      failed: []
    };

  assert.deepEqual(obj.deserialize(), emptyVal);
  assert.deepEqual(obj.deserialize(null), emptyVal);
  assert.deepEqual(obj.deserialize('not an object'), emptyVal);
  assert.deepEqual(obj.deserialize([]), emptyVal);
  assert.deepEqual(obj.deserialize({}), emptyVal);
  assert.deepEqual(
    obj.deserialize({ success: [1, 2, 3], busy: 'not a list' }),
    {
      success: [1, 2, 3],
      pending: [],
      busy: [],
      failed: []
    },
    'missing keys are initialized to and non-list keys are replaced with empty arrays'
  );
});

test('serialize (api <- app)', function(assert) {
  assert.equal(this.subject().serialize('hello'), 'hello', 'direct pass-through when serializing');
});
