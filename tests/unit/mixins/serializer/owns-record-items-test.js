import EmberObject from '@ember/object';
import SerializerOwnsRecordItemsMixin from 'textup-frontend/mixins/serializer/owns-record-items';
import { module, test } from 'qunit';

module('Unit | Mixin | serializer/owns record items');

test('it works', function(assert) {
  const SerializerOwnsRecordItemsObject = EmberObject.extend(SerializerOwnsRecordItemsMixin);
  const obj = SerializerOwnsRecordItemsObject.create();

  assert.equal(
    obj.attrs.lastRecordActivity.serialize,
    false,
    'do not serialize lastRecordActivity'
  );
  assert.equal(obj.attrs.language.serialize, true, 'DO serialize language');
  assert.equal(obj.attrs._recordItems.serialize, false, 'do not serialize _recordItems');
  assert.notOk(obj.attrs._recordTexts, 'do not break out polymorphic sub-types');
  assert.notOk(obj.attrs._recordCalls, 'do not break out polymorphic sub-types');
  assert.notOk(obj.attrs._recordNotes, 'do not break out polymorphic sub-types');
});
