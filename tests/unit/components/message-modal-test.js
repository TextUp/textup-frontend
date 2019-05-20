import Service from '@ember/service';
import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('message-modal', 'Unit | Component | message modal', {
  unit: true,
  beforeEach() {
    this.register('service:storageService', Service);
  },
});

test('invalid inputs', function(assert) {
  assert.throws(
    () => this.subject(),
    TestUtils.ERROR_PROP_MISSING,
    'requires message location url'
  );
});
