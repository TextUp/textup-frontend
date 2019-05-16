import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { run, typeOf } = Ember;

moduleForComponent('account-switcher', 'Integration | Component | account switcher', {
  integration: true,
  beforeEach() {
    this.inject.service('store');
  },
});

test('valid inputs', function(assert) {
  const staff = run(() => this.store.createRecord('staff'));
  this.setProperties({ staff, fn: sinon.spy() });

  this.render(hbs`
    {{account-switcher user=staff
      onLogOut=fn
      doRegister=fn
      activeName="hi"
      activeNumber="hi"
      toggleClass="hi"}}
  `);

  assert.ok(this.$('.textup-account-switcher').length, 'did render');
});

test("registering hide show's public API", function(assert) {
  const staff = run(() => this.store.createRecord('staff')),
    onLogOut = sinon.spy(),
    doRegister = sinon.spy();
  this.setProperties({ staff, onLogOut, doRegister });

  this.render(hbs`{{account-switcher user=staff onLogOut=onLogOut doRegister=doRegister}}`);
  assert.ok(this.$('.textup-account-switcher').length, 'did render');
  assert.ok(doRegister.calledOnce);
  assert.equal(doRegister.firstCall.args.length, 1);
  assert.equal(typeOf(doRegister.firstCall.args[0]), 'object');
  assert.equal(typeOf(doRegister.firstCall.args[0].isOpen), 'boolean');
  assert.equal(typeOf(doRegister.firstCall.args[0].actions.toggle), 'function');
  assert.equal(typeOf(doRegister.firstCall.args[0].actions.open), 'function');
  assert.equal(typeOf(doRegister.firstCall.args[0].actions.close), 'function');
  assert.equal(typeOf(doRegister.firstCall.args[0].actions.closeThenCall), 'function');
});

test('custom class for the toggle', function(assert) {
  const staff = run(() => this.store.createRecord('staff')),
    onLogOut = sinon.spy(),
    toggleClass = 'custom-toggle-class';
  this.setProperties({ staff, onLogOut, toggleClass });

  this.render(
    hbs`{{account-switcher user=staff onLogOut=onLogOut doRegister=doRegister toggleClass=toggleClass}}`
  );
  assert.ok(this.$('.textup-account-switcher').length, 'did render');
  assert.ok(
    this.$('.textup-account-switcher__display.' + toggleClass).length,
    'has custom toggle class'
  );
});

test('rendering block', function(assert) {
  const staff = run(() => this.store.createRecord('staff')),
    onLogOut = sinon.spy(),
    customText = Math.random() + '';
  this.setProperties({ staff, onLogOut, customText });

  this.render(hbs`
    {{#account-switcher user=staff onLogOut=onLogOut}}
      {{customText}}
    {{/account-switcher}}
  `);
  assert.ok(this.$('.textup-account-switcher').length, 'did render');
  assert.ok(
    this.$('.textup-account-switcher__display-container')
      .text()
      .indexOf(customText) > -1,
    'yields block in the toggle'
  );
});

test('displaying active name and number', function(assert) {
  const staff = run(() => this.store.createRecord('staff')),
    onLogOut = sinon.spy(),
    activeName = Math.random() + '',
    activeNumber = Math.random() + '';
  this.setProperties({ staff, onLogOut, activeName, activeNumber });

  this.render(
    hbs`{{account-switcher user=staff onLogOut=onLogOut activeName=activeName activeNumber=activeNumber}}`
  );
  assert.ok(this.$('.textup-account-switcher').length, 'did render');

  const text = this.$('.textup-account-switcher__display').text();
  assert.ok(text.indexOf(activeName) > -1, 'shows active name');
  assert.ok(text.indexOf(activeNumber) > -1, 'shows active number');
});

test('trigger log out + user has no phones and is not admin', function(assert) {
  const staff = run(() => this.store.createRecord('staff')),
    onLogOut = sinon.spy(),
    done = assert.async();
  this.setProperties({ staff, onLogOut });

  this.render(hbs`{{account-switcher user=staff onLogOut=onLogOut}}`);
  assert.ok(this.$('.textup-account-switcher').length, 'did render');
  assert.ok(this.$('.textup-account-switcher__display').length, 'has toggle');
  assert.notOk(this.$('.textup-account-switcher__accounts').length, 'no accounts shown');

  this.$('.textup-account-switcher__display')
    .eq(0)
    .triggerHandler('click');
  wait()
    .then(() => {
      assert.ok(this.$('.textup-account-switcher__accounts').length, 'accounts shown');
      assert.ok(onLogOut.notCalled);

      assert.equal(
        this.$('.textup-account-switcher__accounts .menu-item').length,
        1,
        'only option is to log out'
      );
      this.$('.textup-account-switcher__accounts .menu-item')
        .eq(0)
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok(onLogOut.calledOnce);

      done();
    });
});

test('trigger log out + when no user is provided', function(assert) {
  const onLogOut = sinon.spy(),
    done = assert.async();
  this.setProperties({ onLogOut });

  this.render(hbs`{{account-switcher onLogOut=onLogOut}}`);
  assert.ok(this.$('.textup-account-switcher').length, 'did render');
  assert.ok(this.$('.textup-account-switcher__display').length, 'has toggle');
  assert.notOk(this.$('.textup-account-switcher__accounts').length, 'no accounts shown');

  this.$('.textup-account-switcher__display')
    .eq(0)
    .triggerHandler('click');
  wait()
    .then(() => {
      assert.ok(this.$('.textup-account-switcher__accounts').length, 'accounts shown');
      assert.ok(onLogOut.notCalled);

      assert.equal(
        this.$('.textup-account-switcher__accounts .menu-item').length,
        1,
        'only option is to log out'
      );
      this.$('.textup-account-switcher__accounts .menu-item')
        .eq(0)
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok(onLogOut.calledOnce);

      done();
    });
});

// [NOTE] cannot test routing as a limitation of component integration testing. Either factor out
// routing logic out of this component or write an acceptance test
test('accounts when user has phones and is admin', function(assert) {
  const staffName = Math.random() + '',
    phoneNumber = Math.random() + '',
    staff = run(() =>
      this.store.createRecord('staff', {
        name: staffName,
        isAdmin: true,
        phone: this.store.createRecord('phone', { number: phoneNumber, isActive: true }),
      })
    ),
    onLogOut = sinon.spy(),
    done = assert.async();
  this.setProperties({ staff, onLogOut });

  this.render(hbs`{{account-switcher user=staff onLogOut=onLogOut}}`);
  assert.ok(this.$('.textup-account-switcher').length, 'did render');
  assert.ok(this.$('.textup-account-switcher__display').length, 'has toggle');
  assert.notOk(this.$('.textup-account-switcher__accounts').length, 'no accounts shown');

  this.$('.textup-account-switcher__display')
    .eq(0)
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(this.$('.textup-account-switcher__accounts').length, 'accounts shown');
    assert.equal(
      this.$('.textup-account-switcher__accounts .menu-item').length,
      3,
      'active phone is displayed + log out + no admin because not admin'
    );

    const firstItem = this.$('.textup-account-switcher__accounts .menu-item').eq(0);
    assert.ok(firstItem.text().indexOf(staffName) > -1, 'first item is staff phone');
    assert.ok(firstItem.text().indexOf(phoneNumber) > -1, 'first item is staff phone');
    assert.ok(
      this.$('.textup-account-switcher__accounts .menu-item')
        .eq(1)
        .text()
        .toLowerCase()
        .indexOf('admin') > -1,
      'second item is admin'
    );
    assert.ok(
      this.$('.textup-account-switcher__accounts .menu-item')
        .eq(2)
        .text()
        .toLowerCase()
        .indexOf('log out') > -1,
      'third item is log out'
    );
    done();
  });
});
