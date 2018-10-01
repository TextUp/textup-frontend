import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { typeOf } = Ember;

moduleForComponent('hide-show', 'Integration | Component | hide show', {
  integration: true
});

test('inputs', function(assert) {
  assert.throws(() => this.render(hbs`{{hide-show doRegister="hi"}}`));

  this.render(hbs`{{hide-show}}`);

  assert.ok(this.$('.ember-view').length);

  this.setProperties({ doRegister: () => null });
  this.render(hbs`{{hide-show doRegister=doRegister}}`);

  assert.ok(this.$('.ember-view').length);
});

test('registering', function(assert) {
  const doRegister = sinon.spy(),
    done = assert.async();
  this.setProperties({ doRegister });

  this.render(hbs`{{hide-show doRegister=doRegister}}`);

  assert.ok(this.$('.ember-view').length);
  assert.ok(doRegister.calledOnce);
  assert.equal(doRegister.firstCall.args.length, 1);
  assert.equal(typeOf(doRegister.firstCall.args[0]), 'object');
  assert.equal(typeOf(doRegister.firstCall.args[0].isOpen), 'boolean');
  assert.equal(typeOf(doRegister.firstCall.args[0].actions), 'object');
  ['toggle', 'open', 'close'].every(name =>
    Object.keys(doRegister.firstCall.args[0].actions).includes(name)
  );
  Object.values(doRegister.firstCall.args[0].actions).every(val => typeOf(val) === 'function');

  const publicAPI = doRegister.firstCall.args[0];

  publicAPI.actions.close();
  wait()
    .then(() => {
      assert.equal(publicAPI.isOpen, false);

      publicAPI.actions.open();
      return wait();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, true);

      publicAPI.actions.toggle();
      return wait();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, false);

      publicAPI.actions.toggle();
      return wait();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, true);

      done();
    });
});

test('rendering block and public API', function(assert) {
  const doRegister = sinon.spy(),
    onClick = sinon.spy(),
    bodyText = `${Math.random()}`,
    done = assert.async();
  this.setProperties({ doRegister, onClick, bodyText });

  this.render(hbs`
    {{#hide-show doRegister=doRegister as |api|}}
      {{bodyText}}
      <button type='button' onclick={{action onClick api}}></button>
    {{/hide-show}}
  `);

  assert.ok(this.$('.ember-view').length);
  assert.ok(doRegister.calledOnce);
  assert.equal(doRegister.firstCall.args.length, 1);
  assert.ok(onClick.notCalled);
  assert.ok(
    this.$()
      .text()
      .includes(bodyText)
  );

  this.$('.ember-view button')
    .first()
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(doRegister.calledOnce);
    assert.ok(onClick.calledOnce);

    assert.deepEqual(doRegister.firstCall.args[0], onClick.firstCall.args[0]);

    done();
  });
});
