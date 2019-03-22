import Ember from 'ember';
import { mockModel } from '../../helpers/utilities';
import { moduleForModel, test } from 'ember-qunit';

const { typeOf } = Ember;

moduleForModel('record-call', 'Unit | Serializer | record call', {
  needs: [
    'model:contact',
    'model:media',
    'model:tag',
    'serializer:record-call',
    'transform:record-item-status',
    'validator:has-any',
    'validator:inclusion',
  ],
});

test('serialized form', function(assert) {
  const obj = this.subject(),
    serialized = obj.serialize(),
    keys = Object.keys(serialized);

  assert.ok(keys.contains('type'), 'type is converted back to backend format');
  assert.equal(serialized.type, 'CALL');

  assert.notOk(keys.contains('durationInSeconds'));
  assert.notOk(keys.contains('voicemailInSeconds'));
});
