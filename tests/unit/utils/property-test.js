import EmberObject from '@ember/object';
import RSVP from 'rsvp';
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
    obj1 = EmberObject.create(),
    obj2 = EmberObject.create({ [propName]: propVal });

  assert.throws(() => PropertyUtils.mustGet(obj1, propName, errorString), new Error(errorString));
  assert.equal(PropertyUtils.mustGet(obj2, propName, errorString), propVal);
});

test('ensuring promise', function(assert) {
  const done = assert.async(),
    notPromiseValue = Math.random(),
    val2 = Math.random(),
    promiseValue = new RSVP.Promise(resolve => resolve(val2));

  PropertyUtils.ensurePromise(notPromiseValue)
    .then(arg1 => {
      assert.equal(arg1, notPromiseValue);

      return PropertyUtils.ensurePromise(promiseValue);
    })
    .then(arg1 => {
      assert.equal(arg1, val2);

      done();
    });
});
