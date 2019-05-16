import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('record-note-revision', 'Unit | Component | record note revision', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING);

  assert.throws(
    () => this.subject({ revision: 'not a revision' }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'requires revision to be a RecordNoteRevision'
  );
});
