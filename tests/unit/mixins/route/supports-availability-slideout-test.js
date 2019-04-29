import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import RouteSupportsAvailabilitySlideoutMixin from 'textup-frontend/mixins/route/supports-availability-slideout';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

const { RSVP, typeOf } = Ember;

let startCompleteTask;

moduleFor(
  'mixin:route/supports-availability-slideout',
  'Unit | Mixin | route/supports availability slideout',
  {
    needs: [
      'service:analytics',
      'service:data-service',
      'service:auth-service',
      'service:availability-slideout-service',
    ],
    beforeEach() {
      startCompleteTask = sinon.spy();
      this.register('service:tutorial-service', Ember.Service.extend({ startCompleteTask }));
      this.register(
        'route:supports-availability-slideout',
        Ember.Route.extend(RouteSupportsAvailabilitySlideoutMixin)
      );
    },
  }
);

test('starting slideout', function(assert) {
  const route = Ember.getOwner(this).lookup('route:supports-availability-slideout');
  route.setProperties({ routeName: Math.random(), send: sinon.spy() });

  route.actions.startAvailabilitySlideout.call(route);

  assert.ok(route.send.calledOnce);
  assert.equal(route.send.firstCall.args[0], 'toggleSlideout');
  assert.equal(route.send.firstCall.args[1], 'slideouts/availability');
  assert.equal(route.send.firstCall.args[2], route.get('routeName'));
  assert.equal(route.send.firstCall.args[3], Constants.SLIDEOUT.OUTLET.DEFAULT);
});

test('cancelling slideout', function(assert) {
  const route = Ember.getOwner(this).lookup('route:supports-availability-slideout');
  route.setProperties({
    currentModel: { rollbackAttributes: sinon.spy() },
    authService: { authUser: { rollbackAttributes: sinon.spy() } },
    send: sinon.spy(),
  });

  route.actions.cancelAvailabilitySlideout.call(route);

  assert.ok(route.send.calledOnce);
  assert.equal(route.send.firstCall.args[0], 'closeSlideout');
  assert.ok(route.currentModel.rollbackAttributes.calledOnce);
  assert.ok(route.authService.authUser.rollbackAttributes.calledOnce);
});

test('finishing slideout', function(assert) {
  const done = assert.async(),
    route = Ember.getOwner(this).lookup('route:supports-availability-slideout');
  route.setProperties({
    dataService: { persist: sinon.stub().returns(new RSVP.Promise(resolve => resolve())) },
    currentModel: sinon.spy(),
    authService: { authUser: sinon.spy() },
    send: sinon.spy(),
  });

  route.actions.finishAvailabilitySlideout.call(route).then(() => {
    assert.ok(startCompleteTask.calledWith('setAvailability'));
    assert.ok(route.send.calledOnce);
    assert.equal(route.send.firstCall.args[0], 'closeSlideout');

    assert.ok(route.dataService.persist.calledOnce);
    assert.equal(typeOf(route.dataService.persist.firstCall.args[0]), 'array');
    assert.ok(
      route.dataService.persist.firstCall.args[0].every(
        obj => obj === route.currentModel || obj === route.authService.authUser
      )
    );

    done();
  });
});

test('delegating finishing recording greeting', function(assert) {
  const route = Ember.getOwner(this).lookup('route:supports-availability-slideout'),
    phoneSpy = sinon.spy(),
    input2 = Math.random(),
    input3 = Math.random();
  route.setProperties({
    availabilitySlideoutService: { onAddAudio: sinon.spy() },
    currentModel: { phone: { content: phoneSpy } },
  });

  route.actions.onFinishRecordingGreeting.call(route, input2, input3);

  assert.ok(route.availabilitySlideoutService.onAddAudio.calledOnce);
  assert.ok(route.availabilitySlideoutService.onAddAudio.calledWith(phoneSpy, input2, input3));
});

test('delegating requesting voicemail greeting call', function(assert) {
  const route = Ember.getOwner(this).lookup('route:supports-availability-slideout'),
    currentModelSpy = sinon.spy(),
    input2 = Math.random();
  route.setProperties({
    availabilitySlideoutService: { onRequestVoicemailGreetingCall: sinon.spy() },
    currentModel: currentModelSpy,
  });

  route.actions.onRequestVoicemailGreetingCall.call(route, input2);

  assert.ok(route.availabilitySlideoutService.onRequestVoicemailGreetingCall.calledOnce);
  assert.ok(
    route.availabilitySlideoutService.onRequestVoicemailGreetingCall.calledWith(
      currentModelSpy,
      input2
    )
  );
});
