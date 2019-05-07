import * as LockContainerComponent from 'textup-frontend/components/lock-container';
import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('lock-container', 'Integration | Component | lock container', {
  integration: true,
  beforeEach() {
    this.inject.service('pageVisibilityService');
  },
});

test('component renders', function(assert) {
  const doUpdateValStub = sinon.stub(),
    doValidateStub = sinon.stub();

  this.setProperties({ doUpdateValStub, doValidateStub });
  this.render(hbs`{{lock-container onChange=doUpdateValStub onValidate=doValidateStub}}`);
  assert.ok(this.$('.lock-container').length, 'it renders');

  // check requires proptypes
  assert.throws(() => this.render(hbs`{{lock-pad}}`), 'throws errors for required props');
});

test('validation locks/unlocks', function(assert) {
  const done = assert.async(),
    doValidateStub = sinon.stub(),
    doUpdateValStub = sinon.stub();

  this.setProperties({ val: '', doUpdateValStub, doValidateStub });
  this.render(hbs`
    {{lock-container val=val
      shouldStartLocked=true
      onChange=doUpdateValStub
      onValidate=doValidateStub
      username="bob"}}
  `);

  this.set('val', `${Math.random()}`);
  wait()
    .then(() => {
      // changing val calls doValidate
      // gracefully exits when no promise
      assert.equal(doValidateStub.callCount, 1, 'handles no promise');

      doValidateStub.rejects();
      this.render(hbs`
        {{lock-container val=val
          shouldStartLocked=true
          onChange=doUpdateValStub
          onValidate=doValidateStub
          username="bob"}}
      `);
      this.set('val', `${Math.random()}`);
      return wait();
    })
    .then(() => {
      // reject causes lock
      assert.ok(this.$('.lock-pad--error').length, 'errors properly');

      doValidateStub.resolves();
      this.render(hbs`
        {{lock-container
          val=val
          shouldStartLocked=true
          onChange=doUpdateValStub
          onValidate=doValidateStub
          username="bob"}}
      `);
      this.set('val', `${Math.random()}`);
      return wait();
    })
    .then(() => {
      // accept unlocks
      assert.equal(this.$('.lock-pad').length, 0, 'unlocks properly');

      done();
    });
});

test('lock on user logged in, lock on inactivity', function(assert) {
  const done = assert.async(),
    doUpdateValStub = sinon.stub(),
    doValidateStub = sinon.stub();

  // Locked on init when user logged in
  const username = 'bob';
  this.setProperties({ username, doUpdateValStub, doValidateStub });
  this.render(hbs`
    {{lock-container onChange=doUpdateValStub
      onValidate=doValidateStub
      username=username}}
  `);
  assert.ok(this.$('.lock-pad').length, 'locked when user on init');

  // Locked after timout when user logged in
  this.render(hbs`
    {{lock-container timeout=10
      shouldStartLocked=false
      onChange=doUpdateValStub
      onValidate=doValidateStub
      username=username}}
  `);
  assert.equal(this.$('.lock-pad').length, 0);
  this.pageVisibilityService.trigger(config.events.visibility.hidden);

  Ember.run.later(() => {
    this.pageVisibilityService.trigger(config.events.visibility.visible);
    wait().then(() => {
      assert.ok(this.$('.lock-pad').length, 'locked when user on unactive');
      done();
    });
  }, 30);
});

test('no locking when no user logged in', function(assert) {
  const done = assert.async(),
    doUpdateValStub = sinon.stub(),
    doValidateStub = sinon.stub();

  doValidateStub.resolves();

  this.setProperties({ doUpdateValStub, doValidateStub });
  this.render(hbs`
    {{lock-container
      onChange=doUpdateValStub
      onValidate=doValidateStub}}
  `);

  // Unlocked on init when no user logged in
  assert.equal(this.$('.lock-pad').length, 0, 'unlocked when no user on init');

  // Unlocked after timeout when no user logged in
  this.render(hbs`
    {{lock-container timeout=10
      shouldStartLocked=false
      onChange=doUpdateValStub
      onValidate=doValidateStub}}
  `);
  assert.equal(this.$('.lock-pad').length, 0);
  this.pageVisibilityService.trigger(config.events.visibility.hidden);

  Ember.run.later(() => {
    this.pageVisibilityService.trigger(config.events.visibility.visible);
    wait().then(() => {
      assert.equal(this.$('.lock-pad').length, 0, 'unlocked when no user on inactive');
      done();
    });
  }, 100);
});

test('fingerprint auth', function(assert) {
  const done = assert.async(),
    doValidateStub = sinon.stub(),
    doUpdateValStub = sinon.stub(),
    show = sinon.stub(),
    isAvailable = sinon.stub(),
    hasCordova = sinon.stub(config, 'hasCordova').get(() => true);
  const originalFingerprint = window.Fingerprint;

  window.Fingerprint = { isAvailable, show };
  this.setProperties({ val: '', doUpdateValStub, doValidateStub });
  this.render(hbs`
    {{lock-container
      val=val
      doRegister=(action (mut lockContainer))
      shouldStartLocked=true
      onChange=doUpdateValStub
      onValidate=doValidateStub
      username="bob"}}
  `);

  assert.ok(isAvailable.notCalled, 'Not called at start');
  assert.ok(show.notCalled);

  $(document).trigger($.Event('deviceready'));

  wait().then(() => {
    assert.ok(this.get('lockContainer').isLocked);
    assert.ok(isAvailable.calledOnce);
    assert.ok(show.notCalled);

    isAvailable.firstCall.args[0].call();

    assert.ok(isAvailable.calledOnce, 'Called after device ready');
    assert.ok(show.calledOnce);
    show.firstCall.args[1].call();

    // how to make window show unlock?
    assert.equal(this.get('lockContainer').isLocked, false);

    assert.deepEqual(show.firstCall.args[0], {
      clientId: LockContainerComponent.CLIENT_MESSAGE,
      clientSecret: LockContainerComponent.CLIENT_PASSWORD,
    });
    assert.equal(Ember.typeOf(show.firstCall.args[1]), 'function');

    window.Fingerprint = originalFingerprint;
    hasCordova.restore();
    done();
  });
});

test('logging out', function(assert) {
  const onLogOut = sinon.spy(),
    username = Math.random() + '',
    done = assert.async();
  this.setProperties({ onLogOut, username });

  this.render(hbs`{{lock-container onLogOut=onLogOut username=username}}`);

  assert.ok(this.$('.lock-container').length, 'did render');
  assert.ok(this.$('.single-footer button').length, 'is locked + has logout button');

  this.$('.single-footer button')
    .eq(0)
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(onLogOut.calledOnce);

    done();
  });
});

test('lock + unlock via the public API', function(assert) {
  const doRegister = sinon.spy(),
    username = Math.random() + '',
    done = assert.async();
  this.setProperties({ doRegister, username });

  this.render(hbs`{{lock-container doRegister=doRegister username=username}}`);

  assert.ok(this.$('.lock-container').length, 'did render');
  assert.ok(doRegister.calledOnce);
  assert.equal(doRegister.firstCall.args[0].isLocked, true, 'starts out locked by default');
  assert.ok(this.$('.single-container').length, 'is locked');

  doRegister.firstCall.args[0].actions.unlock();
  wait()
    .then(() => {
      assert.equal(doRegister.firstCall.args[0].isLocked, false, 'not locked');
      assert.notOk(this.$('.single-container').length);

      doRegister.firstCall.args[0].actions.lock();
      return wait();
    })
    .then(() => {
      assert.equal(doRegister.firstCall.args[0].isLocked, true, 'is locked');
      assert.ok(this.$('.single-container').length);

      done();
    });
});

test('determining should lock when trying to lock', function(assert) {
  const onCheckShouldLock = sinon.stub(),
    username = Math.random() + '',
    done = assert.async();
  this.setProperties({ onCheckShouldLock, username });

  this.render(hbs`
    {{lock-container
      onCheckShouldLock=onCheckShouldLock
      username=username
      timeout=0
      shouldStartLocked=false}}
  `);

  assert.ok(this.$('.lock-container').length, 'did render');
  assert.ok(onCheckShouldLock.notCalled);
  assert.notOk(this.$('.single-container').length, 'NOT locked');

  this.pageVisibilityService.trigger(config.events.visibility.hidden);
  wait()
    .then(() => {
      assert.ok(onCheckShouldLock.notCalled);
      assert.notOk(this.$('.single-container').length, 'NOT locked');

      onCheckShouldLock.rejects();
      this.pageVisibilityService.trigger(config.events.visibility.visible);
      return wait();
    })
    .then(() => {
      assert.ok(onCheckShouldLock.calledOnce);
      assert.notOk(
        this.$('.single-container').length,
        'NOT locked because `onCheckShouldLock` rejected'
      );

      onCheckShouldLock.resolves();
      this.pageVisibilityService.trigger(config.events.visibility.visible);
      return wait();
    })
    .then(() => {
      assert.ok(onCheckShouldLock.calledTwice);
      assert.ok(
        this.$('.single-container').length,
        'is locked because `onCheckShouldLock` resolved'
      );

      done();
    });
});

test('disabled', function(assert) {
  const doRegister = sinon.spy(),
    username = Math.random() + '',
    done = assert.async();
  this.setProperties({ doRegister, username });

  this.render(hbs`
    {{lock-container doRegister=doRegister
      shouldStartLocked=true
      username=username
      disabled=true}}
  `);

  assert.ok(this.$('.lock-container').length, 'did render');
  assert.notOk(this.$('.single-container').length, 'NOT locked because is disabled');
  assert.ok(doRegister.calledOnce);
  assert.equal(doRegister.firstCall.args[0].isLocked, false);

  doRegister.firstCall.args[0].actions.lock();
  wait().then(() => {
    assert.notOk(this.$('.single-container').length, 'still NOT locked because is disabled');
    assert.equal(doRegister.firstCall.args[0].isLocked, false);

    done();
  });
});
