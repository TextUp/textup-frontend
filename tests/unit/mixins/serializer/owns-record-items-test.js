import Ember from 'ember';
import SerializerOwnsRecordItemsMixin from 'textup-frontend/mixins/serializer/owns-record-items';
import { module, test } from 'qunit';

module('Unit | Mixin | serializer/owns record items');

test('it works', function(assert) {
  const SerializerOwnsRecordItemsObject = Ember.Object.extend(SerializerOwnsRecordItemsMixin);
  const obj = SerializerOwnsRecordItemsObject.create();

  assert.equal(
    obj.attrs.lastRecordActivity.serialize,
    false,
    'do not serialize lastRecordActivity'
  );
  assert.equal(obj.attrs.language.serialize, true, 'DO serialize language');
  assert.equal(obj.attrs._recordItems.serialize, false, 'do not serialize _recordItems');
  assert.equal(obj.attrs._recordTexts.serialize, false, 'do not serialize _recordTexts');
  assert.equal(obj.attrs._recordCalls.serialize, false, 'do not serialize _recordCalls');
  assert.equal(obj.attrs._recordNotes.serialize, false, 'do not serialize _recordNotes');
});
