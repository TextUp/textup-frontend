import Ember from 'ember';
import ErrorUtils from 'textup-frontend/utils/error';
import { module, test } from 'qunit';

module('Unit | Utility | error');

test('checking if response', function(assert) {
  assert.equal(ErrorUtils.isResponse(), false);
  assert.equal(ErrorUtils.isResponse(null), false);
  assert.equal(ErrorUtils.isResponse('hi'), false);
  assert.equal(ErrorUtils.isResponse({ errors: 'no' }), false);
  assert.equal(ErrorUtils.isResponse({ errors: [] }), true);
});

test('checking status of response', function(assert) {
  const statusCode = Math.random();

  assert.equal(ErrorUtils.isResponseStatus(), false);
  assert.equal(ErrorUtils.isResponseStatus({ errors: ['nope'] }, statusCode), false);
  assert.equal(
    ErrorUtils.isResponseStatus({ errors: ['nope', null, { statusCode }] }, statusCode),
    true,
    'nulls are ignored'
  );
});

test('extracting error mssages from response', function(assert) {
  const val1 = 'hi',
    val2 = Ember.Object.create();

  assert.deepEqual(ErrorUtils.tryExtractResponseMessages(), []);
  assert.deepEqual(
    ErrorUtils.tryExtractResponseMessages({ errors: [null] }),
    [],
    'nulls are ignored'
  );
  assert.deepEqual(ErrorUtils.tryExtractResponseMessages({ errors: ['nope'] }), []);
  assert.deepEqual(
    ErrorUtils.tryExtractResponseMessages({
      errors: [{ message: val1 }, { message: val1 }, { message: val2 }, { message: null }],
    }),
    [val1, val2]
  );
});
