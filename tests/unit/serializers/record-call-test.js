import * as AliasModelNameInitializer from 'textup-frontend/initializers/alias-model-name';
import { moduleForModel, test } from 'ember-qunit';

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
  beforeEach() {
    AliasModelNameInitializer.aliasModelName();
  },
  afterEach() {
    AliasModelNameInitializer.cleanUpModelNameAlias();
  },
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
