import { run } from '@ember/runloop';
import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('location-preview', 'Unit | Component | location preview', {
  unit: true,
  needs: ['model:location', 'validator:presence', 'validator:number'],
  beforeEach() {
    this.inject.service('store');
  },
});

test('invalid inputs', function(assert) {
  const location = run(() => this.store.createRecord('location'));

  assert.throws(() => this.subject(), TestUtils.ERROR_PROP_MISSING, 'requires location');

  assert.throws(
    () => this.subject({ location: {} }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'location must be Location model'
  );

  assert.throws(
    () =>
      this.subject({
        location,
        onSuccess: 'not a function',
        onFailure: 'not a function',
        loadingMessage: 88,
        errorMessage: 88,
      }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'optional properties are of invalid type'
  );
});
