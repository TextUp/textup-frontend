import EmberObject from '@ember/object';
import ErrorUtils from 'textup-frontend/utils/error';
import { module, test } from 'qunit';

module('Unit | Utility | error');

test('normalizing error object', function(assert) {
  const responseJSONObject = { hi: Math.random() },
    status = Math.random(),
    statusText = Math.random();

  assert.equal(ErrorUtils.normalizeErrorObject(null), null);
  assert.equal(ErrorUtils.normalizeErrorObject('not object'), 'not object');
  assert.deepEqual(
    ErrorUtils.normalizeErrorObject({
      [ErrorUtils.ERRORS_PROP_NAME]: [{ [ErrorUtils.STATUS_PROP_NAME]: 0 }],
    }),
    {
      [ErrorUtils.ERRORS_PROP_NAME]: [
        { [ErrorUtils.STATUS_PROP_NAME]: 0, [ErrorUtils.MESSAGE_PROP_NAME]: undefined },
      ],
    },
    'okay to have message missing + supports a status of `0`'
  );
  assert.deepEqual(
    ErrorUtils.normalizeErrorObject({
      [ErrorUtils.ERRORS_PROP_NAME]: [{ [ErrorUtils.STATUS_PROP_NAME]: 'not a number' }],
    }),
    {
      [ErrorUtils.ERRORS_PROP_NAME]: [],
    },
    'a non-number status will be ignored'
  );
  assert.deepEqual(
    ErrorUtils.normalizeErrorObject({
      [ErrorUtils.ERRORS_PROP_NAME]: [{ status: 123, title: 'hi' }, { statusCode: 'NO' }],
    }),
    {
      [ErrorUtils.ERRORS_PROP_NAME]: [
        { [ErrorUtils.STATUS_PROP_NAME]: 123, [ErrorUtils.MESSAGE_PROP_NAME]: 'hi' },
      ],
    },
    'invalid individual errors are ignored + supports `status` for `statusCode` + supports `title` for `message`'
  );
  assert.deepEqual(
    ErrorUtils.normalizeErrorObject({
      [ErrorUtils.ERRORS_PROP_NAME]: [{ status: '123', detail: 'hi', title: 'bye' }],
    }),
    {
      [ErrorUtils.ERRORS_PROP_NAME]: [
        { [ErrorUtils.STATUS_PROP_NAME]: 123, [ErrorUtils.MESSAGE_PROP_NAME]: 'hi' },
      ],
    },
    'tries to convert `status` to number + `detail` for `message` and `detail` takes precedence over `title`'
  );
  assert.equal(
    ErrorUtils.normalizeErrorObject({ responseJSON: responseJSONObject }),
    responseJSONObject
  );
  assert.deepEqual(ErrorUtils.normalizeErrorObject({ status, statusText }), {
    [ErrorUtils.ERRORS_PROP_NAME]: [
      { [ErrorUtils.STATUS_PROP_NAME]: status, [ErrorUtils.MESSAGE_PROP_NAME]: statusText },
    ],
  });
});

test('checking if response', function(assert) {
  assert.equal(ErrorUtils.isResponse(), false);
  assert.equal(ErrorUtils.isResponse(null), false);
  assert.equal(ErrorUtils.isResponse('hi'), false);
  assert.equal(ErrorUtils.isResponse({ errors: 'no' }), false);
  assert.equal(ErrorUtils.isResponse({ errors: [] }), true);

  const errorObj = new Error();
  errorObj.errors = [];
  assert.equal(ErrorUtils.isResponse(errorObj), true, 'also recognizes an object of type `error`');
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
    val2 = EmberObject.create();

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
