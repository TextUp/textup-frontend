import EmberApplication from '@ember/application';
import ServiceMutHelper from 'textup-frontend/helpers/service-mut';
import sinon from 'sinon';
import { module, test } from 'qunit';
import { typeOf } from '@ember/utils';

module('Unit | Helper | service mut');

test('returning working setter function', function(assert) {
  const helper = ServiceMutHelper.create(),
    lookup = sinon.stub(),
    getOwner = sinon.stub(EmberApplication, 'getOwner').returns({ lookup }),
    serviceName = Math.random(),
    notStringPropname = Math.random(),
    stringPropName = 'random-string-key',
    newVal = Math.random(),
    serviceObj = {};

  lookup.returns(null);
  assert.throws(() => helper.compute([serviceName], {}), function(err) {
    return err.toString().includes(serviceName);
  });
  assert.ok(lookup.calledOnce);
  assert.ok(lookup.firstCall.args[0].includes(serviceName));

  lookup.returns(serviceObj);
  assert.throws(() => helper.compute([serviceName, notStringPropname], {}), function(err) {
    return err.toString().includes(notStringPropname);
  });
  assert.ok(lookup.calledTwice);
  assert.ok(lookup.secondCall.args[0].includes(serviceName));

  const retVal = helper.compute([serviceName, stringPropName], {});
  assert.equal(typeOf(retVal), 'function');
  assert.notOk(serviceObj[stringPropName]);

  retVal(newVal);
  assert.equal(serviceObj[stringPropName], newVal);

  getOwner.restore();
});

test('setter function gets a particular property off of the new passed-in value', function(assert) {
  const helper = ServiceMutHelper.create(),
    lookup = sinon.stub(),
    getOwner = sinon.stub(EmberApplication, 'getOwner').returns({ lookup }),
    serviceName = Math.random(),
    stringPropName = 'random-string-key',
    notStringValue = Math.random(),
    newValPropName = 'new-value-prop-name',
    actualNewValue = Math.random(),
    serviceObj = {};

  lookup.returns(serviceObj);

  assert.throws(
    () => helper.compute([serviceName, stringPropName], { value: notStringValue }),
    function(err) {
      return err.toString().includes(notStringValue);
    }
  );

  const retVal = helper.compute([serviceName, stringPropName], { value: newValPropName });

  retVal(null);
  assert.notOk(serviceObj[stringPropName], 'setter is null-safe');

  retVal({ [newValPropName]: actualNewValue });
  assert.equal(
    serviceObj[stringPropName],
    actualNewValue,
    'will pull off the specified property off of the new value and set on the service at the specified service property'
  );

  getOwner.restore();
});
