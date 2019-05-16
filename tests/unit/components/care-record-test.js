import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('care-record', 'Unit | Component | care record', {
  unit: true,
});

test('invalid inputs', function(assert) {
  assert.throws(
    () =>
      this.subject({
        canAddToRecord: 88,
        canModifyExistingInRecord: 88,
        nextFutureFire: 88,
        personalNumber: 88,
        recordClusters: 88,
        numRecordItems: 'not a number',
        totalNumRecordItems: 'not a number',
        images: 88,
        audio: 88,
        contents: 88,
        doRegister: 88,
        onEndOngoingCall: 88,
        onEditNote: 88,
        onRestoreNote: 88,
        onViewNoteHistory: 88,
        onLoadRecordItems: 88,
        onRefreshRecordItems: 88,
        onViewScheduledMessages: 88,
        onContentChange: 88,
        onAddImage: 88,
        onAddAudio: 88,
        onRemoveMedia: 88,
        onAddNote: 88,
        onCall: 88,
        onText: 88,
        onScheduleMessage: 88,
        noRecordItemsMessage: 88,
        noAddToRecordMessage: 88,
        startCallMessage: 88,
        addNoteInPastMessage: 88,
      }),
    TestUtils.ERROR_PROP_WRONG_TYPE
  );
});
