import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('tab-container/item', 'Integration | Component | tab container/item', {
  integration: true,
});

test('inputs', function(assert) {
  this.setProperties({ fn: sinon.spy() });

  assert.throws(() => this.render(hbs`{{tab-container/item}}`));
  assert.throws(() =>
    this.render(hbs`{{tab-container/item doRegister="hi" onDestroy="hi" title=fn}}`)
  );

  this.render(hbs`{{tab-container/item doRegister=fn onDestroy=fn title="hi"}}`);
  assert.ok(this.$('.tab-container__item').length, 'did render');
});

test('rendering block', function(assert) {
  const done = assert.async(),
    doRegister = sinon.spy(),
    blockVal = Math.random() + '';
  this.setProperties({ doRegister, fn: sinon.spy(), blockVal });

  this.render(hbs`
    {{#tab-container/item doRegister=doRegister onDestroy=fn}}
      {{blockVal}}
    {{/tab-container/item}}
  `);
  assert.ok(this.$('.tab-container__item').length, 'did render');
  assert.notOk(
    this.$()
      .text()
      .includes(blockVal),
    'do not render initially'
  );
  assert.ok(doRegister.calledOnce);

  doRegister.firstCall.args[0].actions.show().then(() => {
    wait().then(() => {
      assert.ok(
        this.$()
          .text()
          .includes(blockVal),
        'after initializing or calling show, item is rendered'
      );

      done();
    });
  });
});

test('register and destroy', function(assert) {
  const doRegister = sinon.spy(),
    onDestroy = sinon.spy();
  this.setProperties({ doRegister, onDestroy });

  this.render(hbs`{{tab-container/item doRegister=doRegister onDestroy=onDestroy}}`);
  assert.ok(this.$('.tab-container__item').length, 'did render');

  assert.ok(doRegister.calledOnce);

  this.render(hbs``);

  assert.ok(onDestroy.calledOnce);
});

test('public api actions', function(assert) {
  const doRegister = sinon.spy(),
    onDestroy = sinon.spy(),
    done = assert.async();
  this.setProperties({ doRegister, onDestroy });

  this.render(hbs`{{tab-container/item doRegister=doRegister onDestroy=onDestroy}}`);
  assert.ok(this.$('.tab-container__item').length, 'did render');
  assert.ok(this.$('.tab-container__item.tab-container__item--pending').length, 'is pending');

  assert.ok(doRegister.calledOnce);
  const publicAPI = doRegister.firstCall.args[0];

  publicAPI.actions.initialize(false); // init and hide
  setTimeout(() => {
    assert.notOk(this.$('.tab-container__item.tab-container__item--pending').length, 'not pending');
    assert.notOk(this.$('.tab-container__item:visible').length, 'not visible');
    assert.ok(this.$('.tab-container__item:hidden').length, 'IS hidden');

    publicAPI.actions.initialize(true); // init and show
    setTimeout(() => {
      assert.notOk(
        this.$('.tab-container__item.tab-container__item--pending').length,
        'not pending'
      );
      assert.ok(this.$('.tab-container__item:visible').length, 'IS visible');
      assert.notOk(this.$('.tab-container__item:hidden').length, 'not hidden');

      done();
    }, 500);
  }, 500);
});

test('title will dynamically update', function(assert) {
  const doRegister = sinon.spy(),
    onDestroy = sinon.spy(),
    title1 = Math.random() + '',
    title2 = Math.random() + '',
    done = assert.async();
  this.setProperties({ doRegister, onDestroy, title: title1 });

  this.render(hbs`{{tab-container/item doRegister=doRegister onDestroy=onDestroy title=title}}`);
  assert.ok(this.$('.tab-container__item').length, 'did render');

  assert.ok(doRegister.calledOnce);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.title, title1);

  this.set('title', title2);
  wait().then(() => {
    assert.equal(publicAPI.title, title2);

    done();
  });
});
