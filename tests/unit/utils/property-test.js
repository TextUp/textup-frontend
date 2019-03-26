import Ember from 'ember';
import PropertyUtils from 'textup-frontend/utils/property';
import { module, test } from 'qunit';

module('Unit | Utility | property');

test('building url identifier', function(assert) {
  const modelName = `${Math.random()}`,
    id = `${Math.random()}`;

  assert.ok(PropertyUtils.urlIdent(modelName, id).indexOf(modelName) > -1);
  assert.ok(PropertyUtils.urlIdent(modelName, id).indexOf(modelName) > -1);
});

test('must get', function(assert) {
  const propName = 'testPropName',
    propVal = `${Math.random()}`,
    errorString = `${Math.random()}`,
    obj1 = Ember.Object.create(),
    obj2 = Ember.Object.create({ [propName]: propVal });

  assert.throws(() => PropertyUtils.mustGet(obj1, propName, errorString), new Error(errorString));
  assert.equal(PropertyUtils.mustGet(obj2, propName, errorString), propVal);
});
