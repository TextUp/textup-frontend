import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { format } from 'textup-frontend/utils/phone-number';
import { moduleForComponent, test } from 'ember-qunit';

const { run } = Ember;

moduleForComponent('notification-summary', 'Integration | Component | notification summary', {
  integration: true,
  beforeEach() {
    this.inject.service('store');
  },
});

test('inputs', function(assert) {
  run(() => {
    const notif1 = this.store.createRecord('notification'),
      onOpen = sinon.spy();
    this.setProperties({ notification: notif1, onOpen });

    this.render(hbs`{{notification-summary}}`);
    assert.ok(this.$('.notification-summary').length, 'did render');

    this.render(hbs`{{notification-summary notification=notification onOpen=onOpen}}`);
    assert.ok(this.$('.notification-summary').length, 'did render');

    assert.throws(() =>
      this.render(hbs`{{notification-summary notification="invalid" onOpen="invalid"}}`)
    );
  });
});

test('displaying summary-level information', function(assert) {
  run(() => {
    const notif1 = this.store.createRecord('notification', {
      name: 'squirrel',
      phoneNumber: '999 999 9999',
      incomingNames: 'incoming names',
      outgoingNames: 'outgoing names',
      numVoicemail: 1,
      numIncomingText: 2,
      numIncomingCall: 3,
      numOutgoingText: 4,
      numOutgoingCall: 5,
    });
    this.setProperties({ notif1 });

    this.render(hbs`{{notification-summary notification=notif1}}`);
    assert.ok(this.$('.notification-summary').length, 'did render');

    const text = this.$()
      .text()
      .trim();

    assert.ok(text.indexOf(notif1.get('name')) > -1);
    assert.ok(text.indexOf(format(notif1.get('phoneNumber'))) > -1);
    assert.ok(text.indexOf(notif1.get('incomingNames')) > -1);
    assert.ok(text.indexOf(notif1.get('outgoingNames')) > -1);
    assert.ok(text.indexOf(notif1.get('numVoicemail')) > -1);
    assert.ok(text.indexOf(notif1.get('numIncomingText')) > -1);
    assert.ok(text.indexOf(notif1.get('numIncomingCall')) > -1);
    assert.ok(text.indexOf(notif1.get('numOutgoingText')) > -1);
    assert.ok(text.indexOf(notif1.get('numOutgoingCall')) > -1);
  });
});

test('opening up phone dashboard', function(assert) {
  const onOpen = sinon.spy(),
    done = assert.async();
  this.setProperties({ onOpen });

  this.render(hbs`{{notification-summary}}`);
  assert.ok(this.$('.notification-summary').length, 'did render');
  assert.notOk(this.$('button').length, 'no button');

  this.render(hbs`{{notification-summary onOpen=onOpen}}`);
  assert.ok(this.$('.notification-summary').length, 'did render');
  assert.ok(this.$('button').length, 'has button');

  this.$('button')
    .eq(0)
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(onOpen.calledOnce);
    done();
  });
});
//
