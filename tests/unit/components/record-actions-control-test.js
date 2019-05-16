import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('record-actions-control', 'Unit | Component | record actions control', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(
    () =>
      this.subject({
        hasPersonalNumber: 888,
        hasItemsInRecord: 888,
        images: 888,
        audio: 888,
        contents: 888,
        onHeightChange: 888,
        onContentChange: 888,
        onAddImage: 888,
        onAddAudio: 888,
        onRemoveMedia: 888,
        onAddNoteInPast: 888,
        onAddNote: 888,
        onCall: 888,
        onText: 888,
        onScheduleMessage: 888,
      }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
