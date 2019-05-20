import { typeOf } from '@ember/utils';
import { set } from '@ember/object';
import { moduleFor, test } from 'ember-qunit';
import HasAnyValidator from 'textup-frontend/validators/has-any';

moduleFor('validator:has-any', 'Unit | Validator | has-any', {
  needs: ['validator:messages'],
});

test('validation with varying options', function(assert) {
  var obj = this.subject(),
    model = {
      key1: null,
      key2: { nested: null },
    },
    attribute = 'key 1';

  let result = obj.validate(null, {}, model, attribute);

  assert.equal(typeOf(result), 'string', 'if no options, just checks self');

  result = obj.validate('hello', {}, model, attribute);

  assert.equal(result, true, 'if no options, just checks self');

  result = obj.validate('hello', { also: 'i am not a list' }, model, attribute);

  assert.equal(result, true, 'if invalid options, reverts to only checking self');
});

test('validation with valid inputs', function(assert) {
  var obj = this.subject(),
    options = { also: ['key2.nested', 'missingValue'] },
    model = {
      key2: { nested: null },
    },
    attribute = 'key 1';

  let result = obj.validate(null, options, model, attribute);

  assert.equal(typeOf(result), 'string', 'none are present so return error message');

  result = obj.validate('okay', options, model, attribute);

  assert.equal(result, true, 'has one value of the three');

  set(model, 'key2', { nested: 'ok' });
  result = obj.validate(null, options, model, attribute);

  assert.equal(result, true, 'has nested value of the three');
});

test('dependent key generation', function(assert) {
  let generatedKeys = HasAnyValidator.getDependentsFor('key1', {});
  ['model.key1', 'model.key1.[]'].forEach(key => assert.ok(generatedKeys.includes(key)));

  generatedKeys = HasAnyValidator.getDependentsFor('key1', { also: 'invalid not a list' });
  ['model.key1', 'model.key1.[]'].forEach(key => assert.ok(generatedKeys.includes(key)));

  generatedKeys = HasAnyValidator.getDependentsFor('key1', {
    also: ['key2', 'key3.nested', {}, []],
  });
  [
    'model.key1',
    'model.key1.[]',
    'model.key2',
    'model.key2.[]',
    'model.key3.nested',
    'model.key3.nested.[]',
  ].forEach(key => assert.ok(generatedKeys.includes(key)));
});
