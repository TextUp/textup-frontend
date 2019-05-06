import Ember from 'ember';
import ServicePropHelper from 'textup-frontend/helpers/service-prop';
import sinon from 'sinon';
import { module, test } from 'qunit';

const { run } = Ember;

module('Unit | Helper | service prop');

test('error states + success', function(assert) {
  const helper = ServicePropHelper.create(),
    lookup = sinon.stub(),
    getOwner = sinon.stub(Ember, 'getOwner').returns({ lookup }),
    serviceName = Math.random(),
    notStringPropName = Math.random(),
    stringPropName = 'string-prop-name',
    val1 = Math.random(),
    serviceObj = Ember.Object.create({ [stringPropName]: val1 });

  lookup.returns(null);
  assert.throws(() => helper.compute([serviceName]), err => err.toString().includes(serviceName));

  lookup.returns(serviceObj);
  assert.throws(
    () => helper.compute([serviceName, notStringPropName]),
    err => err.toString().includes(notStringPropName)
  );
  assert.equal(helper.compute([serviceName, stringPropName]), val1);

  getOwner.restore();
});

test('observes for value changes + cleaned-up on destroy', function(assert) {
  const helper = ServicePropHelper.create(),
    recompute = sinon.stub(helper, 'recompute'),
    lookup = sinon.stub(),
    getOwner = sinon.stub(Ember, 'getOwner').returns({ lookup }),
    serviceName = Math.random(),
    propName = 'string-prop-name',
    val1 = Math.random(),
    val2 = Math.random(),
    val3 = Math.random(),
    serviceObj = Ember.Object.create({ [propName]: val1 });

  lookup.returns(serviceObj);
  assert.equal(helper.compute([serviceName, propName]), val1);
  assert.ok(recompute.notCalled);

  serviceObj.set(propName, val2);
  assert.ok(recompute.calledOnce);

  run(() => helper.destroy());

  serviceObj.set(propName, val3);
  assert.ok(recompute.calledOnce);

  recompute.restore();
  getOwner.restore();
});

test('setup is only called at the beginning', function(assert) {
  const helper = ServicePropHelper.create(),
    lookup = sinon.stub(),
    getOwner = sinon.stub(Ember, 'getOwner').returns({ lookup }),
    serviceName = Math.random(),
    propName = 'string-prop-name',
    val1 = Math.random(),
    serviceObj = Ember.Object.create({ [propName]: val1 });

  lookup.returns(serviceObj);
  assert.equal(helper.compute([serviceName, propName]), val1);
  assert.ok(getOwner.calledOnce);

  const _setUp = sinon.stub(helper, '_setUp');
  assert.equal(helper.compute([serviceName, propName]), val1);
  assert.equal(helper.compute([serviceName, propName]), val1);
  assert.equal(helper.compute([serviceName, propName]), val1);
  assert.ok(getOwner.calledOnce, 'getOwner to lookup service only happens once during set up');
  assert.ok(_setUp.notCalled, 'setup is not called again after the helper is initially set up');

  _setUp.restore();
  getOwner.restore();
});
