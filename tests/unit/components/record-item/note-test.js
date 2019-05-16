import Ember from 'ember';
import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

const { run } = Ember;

moduleForComponent('record-item/note', 'Unit | Component | record item/note', {
  unit: true,
  needs: [
    'model:contact',
    'model:location',
    'model:media',
    'model:record-note',
    'model:record-note-revision',
    'model:tag',
    'validator:has-any',
    'validator:inclusion',
  ],
  beforeEach() {
    this.inject.service('store');
  },
});

test('invalid inputs', function(assert) {
  const rNote = run(() => this.store.createRecord('record-note'));

  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING, 'requires note');

  assert.throws(
    () => this.subject({ note: 'not a note' }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'requires note'
  );

  assert.throws(
    () =>
      this.subject({
        note: rNote,
        onEdit: 'not a function',
        onRestore: 'not a function',
        onViewHistory: 'not a function',
      }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'optional inputs need to be correct type'
  );
});
