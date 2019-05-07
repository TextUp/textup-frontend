import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'tour-components/tour-manager',
  'Integration | Component | tour components/tour manager',
  {
    integration: true,
  }
);

test('calls doRegister + onTourFinish', function(assert) {
  const doRegister = sinon.spy(),
    onTourFinish = sinon.spy();
  this.setProperties({ doRegister, onTourFinish });
  this.render(hbs`
    {{tour-components/tour-manager
      onTourFinish=onTourFinish
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
  assert.equal(publicAPI.isOngoing, false, 'tour not ongoing');
  publicAPI.actions.startTour();
  assert.equal(publicAPI.isOngoing, true, 'tour IS not ongoing');
  publicAPI.actions.endTour();
  assert.equal(publicAPI.isOngoing, false, 'tour not ongoing');
  assert.ok(onTourFinish.calledOnce, 'beforeTour called when startTour is called');
});

test('starting/ending tour DOM changes', function(assert) {
  const done = assert.async(),
    doRegister = sinon.spy();

  this.setProperties({ doRegister });
  this.render(hbs`{{tour-components/tour-manager doRegister=doRegister}}`);

  assert.ok(this.$('.ember-view').length, 'did render');
  assert.notOk(this.$('.tour-step').length, 'not showing tour step');
  assert.equal(doRegister.firstCall.args[0].isOngoing, false);

  doRegister.firstCall.args[0].actions.startTour();
  wait()
    .then(() => {
      assert.equal(doRegister.firstCall.args[0].isOngoing, true);
      assert.ok(this.$('.tour-step').length, 'is showing tour step');

      doRegister.firstCall.args[0].actions.endTour();
      return wait();
    })
    .then(() => {
      assert.equal(doRegister.firstCall.args[0].isOngoing, false);
      assert.notOk(this.$('.tour-step').length, 'not showing tour step');

      done();
    });
});
