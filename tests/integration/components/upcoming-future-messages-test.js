import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'upcoming-future-messages',
  'Integration | Component | upcoming future messages',
  {
    integration: true
  }
);

test('date input', function(assert) {
  const invalidDate = 'not a date',
    validDate = new Date();
  this.setProperties({ invalidDate, validDate });

  this.render(hbs`{{upcoming-future-messages}}`);

  assert.ok(this.$('.upcoming-future-messages').length, 'no date is ok');

  this.render(hbs`{{upcoming-future-messages nextFutureFire=validDate}}`);

  assert.ok(this.$('.upcoming-future-messages').length, 'did render');

  assert.throws(
    () => this.render(hbs`{{upcoming-future-messages nextFutureFire=invalidDate}}`),
    'if specified, must be date'
  );
});

test('click handler input', function(assert) {
  const invalidFunc = 'not a function',
    validFunc = () => null;
  this.setProperties({ invalidFunc, validFunc });

  this.render(hbs`{{upcoming-future-messages onClick=validFunc}}`);

  assert.ok(this.$('.upcoming-future-messages').length, 'did render');

  assert.throws(
    () => this.render(hbs`{{upcoming-future-messages onClick=invalidFunc}}`),
    'if specified, must be function'
  );
});

test('rendering no date', function(assert) {
  this.render(hbs`{{upcoming-future-messages}}`);

  assert.ok(this.$('.upcoming-future-messages').length, 'did render');
  assert.ok(this.$('.upcoming-future-messages--no-upcoming').length);

  const text = this.$().text();
  assert.ok(text.includes('No'), 'no scheduled messages');
});

test('rendering date in past', function(assert) {
  const date = moment()
    .subtract(1, 'hour')
    .toDate();
  this.setProperties({ date });

  this.render(hbs`{{upcoming-future-messages nextFutureFire=date}}`);

  assert.ok(this.$('.upcoming-future-messages').length, 'did render');
  assert.ok(this.$('.upcoming-future-messages--no-upcoming').length);

  const text = this.$()
    .text()
    .toLowerCase();
  assert.ok(text.includes('sent'), 'says how long ago the message was sent');
  assert.ok(text.includes('ago'));
});

test('rendering date in future', function(assert) {
  const date = moment()
    .add(1, 'hour')
    .toDate();
  this.setProperties({ date });

  this.render(hbs`{{upcoming-future-messages nextFutureFire=date}}`);

  assert.ok(this.$('.upcoming-future-messages').length, 'did render');
  assert.notOk(this.$('.upcoming-future-messages--no-upcoming').length);

  const text = this.$()
    .text()
    .toLowerCase();
  assert.ok(text.includes('next'), 'says next fire date');
  assert.notOk(text.includes('ago'));
});

test('triggering action', function(assert) {
  const onClick = sinon.spy(),
    done = assert.async();

  this.setProperties({ onClick });

  this.render(hbs`{{upcoming-future-messages onClick=onClick}}`);

  assert.ok(this.$('.upcoming-future-messages').length, 'did render');

  this.$('.upcoming-future-messages')
    .first()
    .click();

  wait().then(() => {
    assert.ok(onClick.calledOnce);

    done();
  });
});
