import Ember from 'ember';
import sinon from 'sinon';
import { getServiceAction } from 'textup-frontend/helpers/service-action';
import { module, test } from 'qunit';
import { typeOf } from '@ember/utils';

module('Unit | Helper | service action');

test('helper', function(assert) {
  const lookup = sinon.stub(),
    getOwner = sinon.stub(Ember, 'getOwner').returns({ lookup });
  const serviceName = Math.random(),
    functionName = 'realFunctionName',
    arg1 = Math.random(),
    arg2 = Math.random(),
    arg3 = Math.random(),
    retVal = Math.random(),
    thisFn = sinon.stub().returns(retVal),
    service = { [functionName]: thisFn };

  lookup.returns(null);
  assert.throws(() => getServiceAction([]));
  assert.ok(lookup.calledOnce);
  assert.ok(lookup.firstCall.calledWith('service:undefined'));

  lookup.returns(service);
  assert.throws(() => getServiceAction([serviceName, 'wrongFnName', arg1, arg2]));
  assert.ok(lookup.calledTwice);
  assert.ok(lookup.secondCall.calledWith('service:' + serviceName));

  const helperVal = getServiceAction([serviceName, functionName, arg1, arg2]);
  assert.ok(lookup.calledThrice);
  assert.ok(lookup.thirdCall.calledWith('service:' + serviceName));
  assert.equal(typeOf(helperVal), 'function');
  assert.ok(thisFn.notCalled);

  assert.equal(helperVal.call(null, arg3), retVal);
  assert.ok(thisFn.calledOnce);
  assert.ok(thisFn.firstCall.calledWith(arg1, arg2, arg3));

  getOwner.restore();
});
