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

// TODO from call-if-present
// test('it works', function(assert) {
//   const ctx = Math.random(),
//     fn = sinon.stub(),
//     arg1 = Math.random(),
//     arg2 = Math.random(),
//     retVal = Math.random();

//   assert.notOk(callIfPresent());
//   assert.ok(fn.notCalled);

//   assert.notOk(callIfPresent(null, fn));
//   assert.ok(fn.calledOnce);
//   assert.equal(fn.firstCall.thisValue, null);
//   assert.equal(fn.firstCall.args.length, 0);

//   fn.returns(retVal);
//   assert.equal(callIfPresent(ctx, fn, [arg1, arg2]), retVal);
//   assert.ok(fn.calledTwice);
//   assert.ok(fn.secondCall.thisValue, ctx);
//   assert.equal(fn.secondCall.args.length, 2);
//   assert.equal(fn.secondCall.args[0], arg1);
//   assert.equal(fn.secondCall.args[1], arg2);
// });
