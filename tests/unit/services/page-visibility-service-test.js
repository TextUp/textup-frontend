import * as PageVisibilityService from 'textup-frontend/services/page-visibility-service';
import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:page-visibility-service', 'Unit | Service | page visibility service');

test('when the page visibility API is available', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    visibilityState = sinon.stub(document, PageVisibilityService.STATE_PROP_NAME),
    onVisible = sinon.spy(),
    onHidden = sinon.spy();

  service.startWatchingVisibilityChanges();
  service
    .on(config.events.visibility.visible, onVisible)
    .on(config.events.visibility.hidden, onHidden);

  assert.ok(service.get('isVisible'));
  assert.ok(onVisible.notCalled);
  assert.ok(onHidden.notCalled);

  visibilityState.get(() => 'hidden');
  Ember.$(document).triggerHandler('visibilitychange');
  wait()
    .then(() => {
      assert.notOk(service.get('isVisible'));
      assert.ok(onVisible.notCalled);
      assert.ok(onHidden.calledOnce);

      visibilityState.get(() => PageVisibilityService.STATE_VISIBLE);
      Ember.$(document).triggerHandler('visibilitychange');
      return wait();
    })
    .then(() => {
      assert.ok(service.get('isVisible'));
      assert.ok(onVisible.calledOnce);
      assert.ok(onHidden.calledOnce);

      visibilityState.restore();
      done();
    });
});

test('when the page visibility API is NOT available', function(assert) {
  const visibilityState = sinon.stub(document, PageVisibilityService.STATE_PROP_NAME);
  visibilityState.get(() => undefined); // page visbility API not available

  // service creation must happen AFTER the visibilityState is overridden
  const service = this.subject(),
    done = assert.async(),
    onVisible = sinon.spy(),
    onHidden = sinon.spy();

  service.startWatchingVisibilityChanges();
  service
    .on(config.events.visibility.visible, onVisible)
    .on(config.events.visibility.hidden, onHidden);

  assert.ok(service.get('isVisible'));
  assert.ok(onVisible.notCalled);
  assert.ok(onHidden.notCalled);

  Ember.$(window).triggerHandler('blur');
  wait()
    .then(() => {
      assert.notOk(service.get('isVisible'));
      assert.ok(onVisible.notCalled);
      assert.ok(onHidden.calledOnce);

      Ember.$(window).triggerHandler('focus');
      return wait();
    })
    .then(() => {
      assert.ok(service.get('isVisible'));
      assert.ok(onVisible.calledOnce);
      assert.ok(onHidden.calledOnce);

      visibilityState.restore();
      done();
    });
});
