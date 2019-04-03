import callIfPresent from 'textup-frontend/utils/call-if-present';
import sinon from 'sinon';
import { module, test } from 'qunit';

module('Unit | Utility | call if present');

test('it works', function(assert) {
  const ctx = Math.random(),
    fn = sinon.stub(),
    arg1 = Math.random(),
    arg2 = Math.random(),
    retVal = Math.random();

  assert.notOk(callIfPresent());
  assert.ok(fn.notCalled);

  assert.notOk(callIfPresent(null, fn));
  assert.ok(fn.calledOnce);
  assert.equal(fn.firstCall.thisValue, null);
  assert.equal(fn.firstCall.args.length, 0);

  fn.returns(retVal);
  assert.equal(callIfPresent(ctx, fn, [arg1, arg2]), retVal);
  assert.ok(fn.calledTwice);
  assert.ok(fn.secondCall.thisValue, ctx);
  assert.equal(fn.secondCall.args.length, 2);
  assert.equal(fn.secondCall.args[0], arg1);
  assert.equal(fn.secondCall.args[1], arg2);
});
