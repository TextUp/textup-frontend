import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import NotificationsService from 'ember-cli-notifications/services/notification-messages-service';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

const { run } = Ember;

moduleForComponent(
  'tour-components/tour-manager',
  'Integration | Component | tour components/tour manager',
  {
    integration: true,
    beforeEach() {
      this.register('service:notifications', NotificationsService);
    }
  }
);

test('calls doRegister, beforeTour and afterTour', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  const doRegister = sinon.spy(),
    beforeTour = sinon.spy(),
    afterTour = sinon.spy();
  this.setProperties({ doRegister, beforeTour, afterTour });
  this.render(hbs`{{tour-components/tour-manager
      beforeTour=beforeTour
      afterTour=afterTour
      doRegister=doRegister
  }}`);
  assert.ok(doRegister.calledOnce, 'doRegister called after render');
  const publicAPI = doRegister.firstCall.args[0];

  assert.equal(
    this.$()
      .text()
      .trim(),
    '',
    "nothing to render because tour hasn't started"
  );
  run(() => {
    publicAPI.actions.startTour();
  });
  assert.ok(beforeTour.calledOnce, 'beforeTour called when startTour is called');
  run(() => {
    publicAPI.actions.endTour();
  });
  assert.ok(afterTour.calledOnce, 'beforeTour called when startTour is called');
});
