import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import config from 'textup-frontend/config/environment';

moduleForComponent('lock-container', 'Integration | Component | lock container', {
  integration: true,
});

test('it renders', function(assert) {
  const doUpdateValStub = sinon.stub(),
    doValidateStub = sinon.stub();

  this.setProperties({ doUpdateValStub, doValidateStub });
  this.render(hbs`{{lock-container doUpdateVal=doUpdateValStub doValidate=doValidateStub}}`);
  assert.ok(this.$('.lock-container').length, 'it renders');

  // requires proptypes
  assert.throws(() => this.render(hbs`{{lock-pad}}`), 'throws errors for required props');
});

test('validation locks/unlocks', function(assert) {
  const done = assert.async(),
    doValidateStub = sinon.stub(),
    doUpdateValStub = sinon.stub();

  this.setProperties({ val: '', doUpdateValStub, doValidateStub });
  this.render(
    hbs`{{lock-container val=val lockOnInit=true doUpdateVal=doUpdateValStub doValidate=doValidateStub username = 'bob'}}`
  );

  this.set('val', `${Math.random()}`);
  wait()
    .then(() => {
      // changing val calls doValidate
      // gracefully exits when no promise
      assert.equal(doValidateStub.callCount, 1, 'handles no promise');

      doValidateStub.rejects();
      this.render(
        hbs`{{lock-container val=val lockOnInit=true doUpdateVal=doUpdateValStub doValidate=doValidateStub username = 'bob'}}`
      );
      this.set('val', `${Math.random()}`);
      return wait();
    })
    .then(() => {
      // reject causes lock
      assert.ok(this.$('.lock-pad--error').length, 'errors properly');

      doValidateStub.resolves();
      this.render(
        hbs`{{lock-container val=val lockOnInit=true doUpdateVal=doUpdateValStub doValidate=doValidateStub username = 'bob'}}`
      );
      this.set('val', `${Math.random()}`);

      return wait();
    })
    .then(() => {
      // accept unlocks
      assert.ok(this.$('.lock-pad').length === 0, 'unlocks properly');

      done();
    });
});

test('lock on user logged in', function(assert) {
  const done = assert.async(),
    doUpdateValStub = sinon.stub(),
    doValidateStub = sinon.stub();

  // Locked on init when user logged in
  const username = 'bob';
  this.setProperties({ username, doUpdateValStub, doValidateStub });
  this.render(
    hbs`{{lock-container doUpdateVal=doUpdateValStub doValidate=doValidateStub username=username}}`
  );
  assert.ok(this.$('.lock-pad').length, 'locked when user on init');

  // Locked after timout when user logged in
  this.render(
    hbs`{{lock-container timeout=10 lockOnInit=false doUpdateVal=doUpdateValStub doValidate=doValidateStub username=username}}`
  );
  assert.ok(this.$('.lock-pad').length === 0);
  this.container.lookup('service:visibility').trigger(config.events.visibility.hidden);

  Ember.run.later(() => {
    this.container.lookup('service:visibility').trigger(config.events.visibility.visible);
    wait().then(() => {
      assert.ok(this.$('.lock-pad').length, 'locked when user on unactive');
      done();
    });
  }, 100);
});

test('no locking when no user logged in', function(assert) {
  const done = assert.async(),
    doUpdateValStub = sinon.stub(),
    doValidateStub = sinon.stub();

  this.setProperties({ doUpdateValStub, doValidateStub });
  this.render(hbs`{{lock-container doUpdateVal=doUpdateValStub doValidate=doValidateStub}}`);

  // Unlocked on init when no user logged in
  assert.ok(this.$('.lock-pad').length === 0, 'unlocked when no user on init');

  // Unlocked after timeout when no user logged in
  this.render(
    hbs`{{lock-container timeout=10 lockOnInit=false doUpdateVal=doUpdateValStub doValidate=doValidateStub}}`
  );
  assert.ok(this.$('.lock-pad').length === 0);
  this.container.lookup('service:visibility').trigger(config.events.visibility.hidden);

  Ember.run.later(() => {
    console.log(this.container.lookup('service:visibility'));
    console.log('TRIg');
    this.container.lookup('service:visibility').trigger(config.events.visibility.visible);
    wait().then(() => {
      assert.ok(this.$('.lock-pad').length === 0, 'unlocked when no user on inactive');
      done();
    });
  }, 100);
});

// test('attempts locks out', function(assert) {
//   const doUpdateValStub = sinon.stub(),
//     doValidateStub = sinon.stub(),
//     doLogoutStub = sinon.stub(),
//     done = assert.async();
//
//   this.setProperties({ val: '', doUpdateValStub, doValidateStub, doLogoutStub });
//   this.render(
//     hbs`{{lock-container val=val lockOnInit=true doUpdateVal=doUpdateValStub doValidate=doValidateStub doLogout=doLogoutStub}}`
//   );
//   doValidateStub.rejects();
//
//   this.set('val', `${Math.random()}`);
//   wait()
//     .then(() => {
//       this.set('val', `${Math.random()}`);
//       return wait();
//     })
//     .then(() => {
//       this.set('val', `${Math.random()}`);
//       return wait();
//     })
//     .then(() => {
//       assert.equal(doLogoutStub.callCount, 0, 'no logout after 3 attempts');
//       this.set('val', `${Math.random()}`);
//       return wait();
//     })
//     .then(() => {
//       assert.equal(doLogoutStub.callCount, 1, 'logout after 4 attempts');
//       done();
//     });
// });
