import Ember from 'ember';
import ServiceMutHelper from 'textup-frontend/helpers/service-mut';
import sinon from 'sinon';
import { module, test } from 'qunit';

const { typeOf } = Ember;

module('Unit | Helper | service mut');

test('returning working setter function', function(assert) {
  const helper = ServiceMutHelper.create(),
    lookup = sinon.stub(),
    getOwner = sinon.stub(Ember, 'getOwner').returns({ lookup }),
    serviceName = Math.random(),
    notStringPropname = Math.random(),
    stringPropName = 'random-string-key',
    newVal = Math.random(),
    serviceObj = {};

  lookup.returns(null);
  assert.throws(() => helper.compute([serviceName]), err => err.toString().includes(serviceName));
  assert.ok(lookup.calledOnce);
  assert.ok(lookup.firstCall.args[0].includes(serviceName));

  lookup.returns(serviceObj);
  assert.throws(
    () => helper.compute([serviceName, notStringPropname]),
    err => err.toString().includes(notStringPropname)
  );
  assert.ok(lookup.calledTwice);
  assert.ok(lookup.secondCall.args[0].includes(serviceName));

  const retVal = helper.compute([serviceName, stringPropName]);
  assert.equal(typeOf(retVal), 'function');
  assert.notOk(serviceObj[stringPropName]);

  retVal(newVal);
  assert.equal(serviceObj[stringPropName], newVal);

  getOwner.restore();
});
