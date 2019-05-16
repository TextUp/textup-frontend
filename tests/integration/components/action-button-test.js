import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { RSVP } = Ember;

moduleForComponent('action-button', 'Integration | Component | action button', {
  integration: true,
});

test('mandatory inputs', function(assert) {
  this.setProperties({ onAction: () => null });

  this.render(hbs`{{action-button onAction=onAction}}`);

  assert.ok(this.$('button.action-button').length, 'did render');
});

test('inputs validation', function(assert) {
  this.setProperties({ onAction: () => null, disabled: true, error: true });

  this.render(hbs`{{action-button onAction=onAction disabled=disabled error=error}}`);

  assert.ok(this.$('button.action-button').length, 'did render');
});

test('rendering block vs nonblock', function(assert) {
  const blockText = `${Math.random()}`;
  this.setProperties({ onAction: () => null, blockText });

  this.render(hbs`{{action-button onAction=onAction}}`);

  assert.ok(this.$('button.action-button').length, 'did render');
  let text = this.$().text();
  assert.notOk(text.includes(blockText));

  this.render(hbs`
    {{#action-button onAction=onAction}}
      {{blockText}}
    {{/action-button}}
  `);

  assert.ok(this.$('button.action-button').length, 'did render');
  text = this.$().text();
  assert.ok(text.includes(blockText), 'block did render');
});

test('disabled/error states', function(assert) {
  this.setProperties({ onAction: () => null, disabled: true, error: true });

  this.render(hbs`{{action-button onAction=onAction disabled=disabled error=error}}`);

  assert.ok(this.$('button.action-button').length, 'did render');
  assert.ok(this.$('button:disabled').length, 'is disabled');
  assert.ok(this.$('button.action-button--disabled').length, 'is disabled');
  assert.ok(this.$('button.action-button--error').length, 'is error');

  this.set('disabled', false);

  assert.ok(this.$('button.action-button').length, 'did render');
  assert.notOk(this.$('button:disabled').length, 'NOT disabled');
  assert.notOk(this.$('button.action-button--disabled').length, 'NOT disabled');
  assert.ok(this.$('button.action-button--error').length, 'is error');

  this.set('error', false);

  assert.ok(this.$('button.action-button').length, 'did render');
  assert.notOk(this.$('button:disabled').length, 'NOT disabled');
  assert.notOk(this.$('button.action-button--disabled').length, 'NOT disabled');
  assert.notOk(this.$('button.action-button--error').length, 'NOT error');
});

test('action is not called when disabled', function(assert) {
  const onAction = sinon.spy(),
    done = assert.async();

  this.setProperties({ onAction, disabled: true });

  this.render(hbs`{{action-button onAction=onAction disabled=disabled}}`);

  assert.ok(this.$('button.action-button').length, 'did render');
  assert.ok(this.$('button:disabled').length, 'is disabled');
  assert.ok(this.$('button.action-button--disabled').length, 'is disabled');

  this.$('button.action-button')
    .first()
    .click();
  wait()
    .then(() => {
      assert.ok(onAction.notCalled);

      this.set('disabled', false);
      return wait();
    })
    .then(() => {
      assert.ok(this.$('button.action-button').length, 'did render');
      assert.notOk(this.$('button:disabled').length, 'NOT disabled');
      assert.notOk(this.$('button.action-button--disabled').length, 'NOT disabled');

      this.$('button.action-button')
        .first()
        .click();
      return wait();
    })
    .then(() => {
      assert.ok(onAction.calledOnce);

      done();
    });
});

test('non-promise action', function(assert) {
  const onAction = sinon.stub().callsFake(() => false),
    done = assert.async();

  this.setProperties({ onAction });

  this.render(hbs`{{action-button onAction=onAction}}`);

  assert.ok(this.$('button.action-button').length, 'did render');
  assert.notOk(this.$('button.action-button--loading').length, 'NOT loading');
  assert.notOk(this.$('button.action-button--error').length, 'NOT error');

  this.$('button.action-button')
    .first()
    .click();
  wait().then(() => {
    assert.ok(onAction.calledOnce);
    assert.notOk(this.$('button.action-button--loading').length, 'non-promise = no state change');
    assert.notOk(this.$('button.action-button--error').length);

    done();
  });
});

// ready -> loading -> ready
test('promise action success', function(assert) {
  let resolveFn;
  const onAction = sinon.stub().callsFake(() => new RSVP.Promise(resolve => (resolveFn = resolve))),
    done = assert.async();

  this.setProperties({ onAction });

  this.render(hbs`{{action-button onAction=onAction}}`);

  assert.ok(this.$('button.action-button').length, 'did render');
  assert.notOk(this.$('button.action-button--loading').length, 'NOT loading');
  assert.notOk(this.$('.action-button__overlay').length, 'no overlay');
  assert.notOk(this.$('button.action-button--error').length, 'NOT error');

  this.$('button.action-button')
    .first()
    .click();
  wait()
    .then(() => {
      assert.ok(onAction.calledOnce);
      assert.ok(resolveFn);
      assert.ok(this.$('button.action-button--loading').length, 'loading');
      assert.ok(this.$('.action-button__overlay').length, 'has overlay');
      assert.notOk(this.$('button.action-button--error').length, 'NOT error');

      resolveFn(); // to resolve the promise
      return wait();
    })
    .then(() => {
      assert.ok(this.$('button.action-button').length, 'back to ready state');
      assert.notOk(this.$('button.action-button--loading').length, 'NOT loading');
      assert.notOk(this.$('.action-button__overlay').length, 'no overlay');
      assert.notOk(this.$('button.action-button--error').length, 'NOT error');

      done();
    });
});

// ready -> loading -> error -> loading -> ready
test('promise action failure then success', function(assert) {
  let resolveFn, rejectFn;
  const onAction = sinon.stub().callsFake(
      () =>
        new RSVP.Promise((resolve, reject) => {
          resolveFn = resolve;
          rejectFn = reject;
        })
    ),
    done = assert.async();

  this.setProperties({ onAction });

  this.render(hbs`{{action-button onAction=onAction}}`);

  assert.ok(this.$('button.action-button').length, 'did render');
  assert.notOk(this.$('button.action-button--loading').length, 'NOT loading');
  assert.notOk(this.$('.action-button__overlay').length, 'no overlay');
  assert.notOk(this.$('button.action-button--error').length, 'NOT error');

  this.$('button.action-button')
    .first()
    .click();
  wait()
    .then(() => {
      assert.ok(onAction.calledOnce);
      assert.ok(rejectFn);
      assert.ok(this.$('button.action-button--loading').length, 'loading');
      assert.ok(this.$('.action-button__overlay').length, 'has overlay');
      assert.notOk(this.$('button.action-button--error').length, 'NOT error');

      rejectFn(); // to reject the promise
      return wait();
    })
    .then(() => {
      assert.ok(this.$('button.action-button').length);
      assert.notOk(this.$('button.action-button--loading').length, 'NOT loading');
      assert.notOk(this.$('.action-button__overlay').length, 'no overlay');
      assert.ok(this.$('button.action-button--error').length, 'error');

      this.$('button.action-button')
        .first()
        .click();
      return wait();
    })
    .then(() => {
      assert.ok(onAction.calledTwice);
      assert.ok(resolveFn);
      assert.ok(this.$('button.action-button--loading').length, 'loading');
      assert.ok(this.$('.action-button__overlay').length, 'has overlay');
      assert.notOk(this.$('button.action-button--error').length, 'NOT error');

      resolveFn(); // to resolve the promise
      return wait();
    })
    .then(() => {
      assert.ok(this.$('button.action-button').length, 'back to ready state');
      assert.notOk(this.$('button.action-button--loading').length, 'NOT loading');
      assert.notOk(this.$('.action-button__overlay').length, 'no overlay');
      assert.notOk(this.$('button.action-button--error').length, 'NOT error');

      done();
    });
});
