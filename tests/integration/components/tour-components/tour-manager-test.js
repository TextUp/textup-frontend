import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import StorageUtils from 'textup-frontend/utils/storage';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'tour-components/tour-manager',
  'Integration | Component | tour components/tour manager',
  {
    integration: true,
  }
);

test('calls doRegister, beforeTour and afterTour', function(assert) {
  const doRegister = sinon.spy(),
    beforeTour = sinon.spy(),
    afterTour = sinon.spy();
  this.setProperties({ doRegister, beforeTour, afterTour });
  this.render(hbs`
    {{tour-components/tour-manager
      beforeTour=beforeTour
      afterTour=afterTour
      doRegister=doRegister}}
  `);
  assert.ok(doRegister.calledOnce, 'doRegister called after render');
  const publicAPI = doRegister.firstCall.args[0];

  assert.equal(
    this.$()
      .text()
      .trim(),
    '',
    "nothing to render because tour hasn't started"
  );
  publicAPI.actions.startTour();
  assert.ok(beforeTour.calledOnce, 'beforeTour called when startTour is called');
  publicAPI.actions.endTour();
  assert.ok(afterTour.calledOnce, 'beforeTour called when startTour is called');
});

test('do not start tour immediately if finish is stored in local storage', function(assert) {
  const doRegister = sinon.spy(),
    getItem = sinon.stub(window.localStorage, 'getItem');
  this.setProperties({ doRegister });

  getItem.returns(null);
  this.render(hbs`{{tour-components/tour-manager doRegister=doRegister}}`);

  assert.ok(doRegister.calledOnce);
  assert.ok(
    doRegister.firstCall.args[0].startTourImmediately,
    'starts immediately because nothing previously stored'
  );

  getItem.returns(StorageUtils.TRUE);
  this.render(hbs`{{tour-components/tour-manager doRegister=doRegister}}`);

  assert.ok(doRegister.calledTwice);
  assert.notOk(doRegister.secondCall.args[0].startTourImmediately, 'does NOT start immediately');

  getItem.restore();
});

test('starting/ending tour + stored keys are properly namespaced', function(assert) {
  const done = assert.async(),
    doRegister = sinon.spy(),
    namespace = Math.random() + '',
    getItem = sinon.stub(window.localStorage, 'getItem'),
    setItem = sinon.stub(window.localStorage, 'setItem');

  this.setProperties({ doRegister, namespace });
  this.render(hbs`{{tour-components/tour-manager doRegister=doRegister username=namespace}}`);

  assert.ok(this.$('.ember-view').length, 'did render');
  assert.notOk(this.$('.tour-step').length, 'not showing tour step');
  assert.ok(
    getItem.calledOnce,
    'getItem called immediately because we want to check to see if we need to start tour'
  );
  assert.ok(getItem.firstCall.args[0].includes(namespace));
  assert.ok(setItem.notCalled);
  assert.ok(doRegister.calledOnce);

  doRegister.firstCall.args[0].actions.startTour();
  wait()
    .then(() => {
      assert.ok(this.$('.tour-step').length, 'is showing tour step');
      assert.ok(setItem.notCalled);

      doRegister.firstCall.args[0].actions.endTour();
      return wait();
    })
    .then(() => {
      assert.notOk(this.$('.tour-step').length, 'not showing tour step');
      assert.ok(setItem.calledOnce);
      assert.ok(setItem.firstCall.args[0].includes(namespace));
      assert.equal(setItem.firstCall.args[1], StorageUtils.TRUE);

      getItem.restore();
      setItem.restore();
      done();
    });
});
