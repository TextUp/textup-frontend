import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { run } = Ember;

moduleForComponent('slideout-pane/accounts', 'Integration | Component | slideout pane/accounts', {
  integration: true,
  beforeEach() {
    this.inject.service('store');
  },
});

test('inputs', function(assert) {
  const staff = run(() => this.store.createRecord('staff'));
  this.setProperties({ staff, fn: sinon.spy() });

  this.render(hbs`
    {{slideout-pane/accounts onClose=fn
      onLogOut=fn
      title="hi"
      user=staff
      activeName="hi"
      activeNumber="hi"}}
  `);
  assert.ok(this.$('.slideout-pane__header').length, 'did render');
  assert.ok(this.$('.textup-account-switcher').length, 'did render');
});

test('displaying title + active owner', function(assert) {
  const staff = run(() => this.store.createRecord('staff')),
    title = Math.random() + '',
    activeName = Math.random() + '',
    activeNumber = Math.random() + '';
  this.setProperties({ staff, title, activeName, activeNumber, fn: sinon.spy() });

  this.render(hbs`
    {{slideout-pane/accounts onClose=fn
      onLogOut=fn
      title=title
      user=staff
      activeName=activeName
      activeNumber=activeNumber}}
  `);
  assert.ok(this.$('.slideout-pane__header').length, 'did render');
  assert.ok(this.$('.textup-account-switcher').length, 'did render');

  assert.ok(
    this.$('.slideout-pane__header')
      .text()
      .indexOf(title) > -1,
    'has title'
  );
  const accountToggleText = this.$('.textup-account-switcher').text();
  assert.ok(accountToggleText.indexOf(activeName) > -1, 'has active name');
  assert.ok(accountToggleText.indexOf(activeNumber) > -1, 'has active number');
});

test('display accounts + log out', function(assert) {
  const staff = run(() => this.store.createRecord('staff', { isAdmin: true })),
    onLogOut = sinon.spy(),
    done = assert.async();
  this.setProperties({ staff, title: 'hi', onLogOut, fn: sinon.spy() });

  this.render(hbs`
    {{slideout-pane/accounts onClose=fn
      onLogOut=onLogOut
      title=title
      user=staff}}
  `);
  assert.ok(this.$('.slideout-pane__header').length, 'did render');
  assert.ok(this.$('.textup-account-switcher').length, 'did render');

  this.$('.textup-account-switcher__display')
    .eq(0)
    .triggerHandler('click');
  wait()
    .then(() => {
      assert.ok(onLogOut.notCalled);
      assert.equal(
        this.$('.textup-account-switcher__accounts .menu-item').length,
        2,
        'has both admin and log out options'
      );

      this.$('.textup-account-switcher__accounts .menu-item')
        .eq(1)
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok(onLogOut.calledOnce);

      done();
    });
});

test('triggering close', function(assert) {
  const staff = run(() => this.store.createRecord('staff', { isAdmin: true })),
    onClose = sinon.spy(),
    done = assert.async();
  this.setProperties({ staff, title: 'hi', onClose, fn: sinon.spy() });

  this.render(hbs`
    {{slideout-pane/accounts onClose=onClose
      onLogOut=fn
      title=title
      user=staff}}
  `);
  assert.ok(this.$('.slideout-pane__header').length, 'did render');
  assert.ok(this.$('.textup-account-switcher').length, 'did render');
  assert.ok(onClose.notCalled);

  this.$('.slideout-pane__header button')
    .eq(0)
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(onClose.calledOnce);

    done();
  });
});
