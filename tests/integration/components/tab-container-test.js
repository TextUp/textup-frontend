import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('tab-container', 'Integration | Component | tab container', {
  integration: true,
});

test('inputs', function(assert) {
  this.setProperties({ fn: sinon.spy() });

  this.render(hbs`{{tab-container}}`);
  assert.ok(this.$('.tab-container').length, 'did render');

  this.render(hbs`{{tab-container startIndex=-1 doRegister=fn onChange=fn}}`);
  assert.ok(this.$('.tab-container').length, 'did render');

  assert.throws(() =>
    this.render(hbs`{{tab-container startIndex=fn doRegister="hi" onChange="hi"}}`)
  );
});

test('rendering no tabs or only one tab hides the navbar', function(assert) {
  this.render(hbs`{{tab-container}}`);
  assert.ok(this.$('.tab-container').length, 'did render');
  assert.ok(this.$('.tab-container-nav.hidden').length, 'navbar is hidden');
  assert.notOk(this.$('.tab-container-body').children().length, 'no children');

  this.render(hbs`
    {{#tab-container as |tabContainer|}}
      {{tab-container/item doRegister=tabContainer.actions.register
        onDestroy=tabContainer.actions.unregister}}
    {{/tab-container}}
  `);
  assert.ok(this.$('.tab-container').length, 'did render');
  assert.ok(this.$('.tab-container-nav.hidden').length, 'navbar is hidden');
  assert.ok(this.$('.tab-container-body').children().length, 'has one tab');
});

test('rendering multiple tabs', function(assert) {
  this.render(hbs`
    {{#tab-container as |tabContainer|}}
      {{tab-container/item doRegister=tabContainer.actions.register
        onDestroy=tabContainer.actions.unregister}}
      {{tab-container/item doRegister=tabContainer.actions.register
        onDestroy=tabContainer.actions.unregister}}
    {{/tab-container}}
  `);
  assert.ok(this.$('.tab-container').length, 'did render');
  assert.notOk(this.$('.tab-container-nav.hidden').length, 'navbar is shown');
  assert.ok(this.$('.tab-container-body').children().length, 'has one tab');

  const $nav = this.$('.tab-container-nav');
  assert.ok($nav.hasClass('overflow') || $nav.hasClass('inline'));
});

test('switching tabs', function(assert) {
  const doRegister = sinon.spy(),
    onChange = sinon.spy(),
    done = assert.async();
  this.setProperties({ doRegister, onChange });

  this.render(hbs`
    {{#tab-container startIndex=1
      doRegister=doRegister
      onChange=onChange as |tabContainer|}}
      {{tab-container/item doRegister=tabContainer.actions.register
        onDestroy=tabContainer.actions.unregister}}
      {{tab-container/item doRegister=tabContainer.actions.register
        onDestroy=tabContainer.actions.unregister}}
      {{tab-container/item doRegister=tabContainer.actions.register
        onDestroy=tabContainer.actions.unregister}}
    {{/tab-container}}
  `);
  assert.ok(this.$('.tab-container').length, 'did render');
  assert.ok(doRegister.calledOnce);
  assert.ok(onChange.notCalled);

  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.currentIndex, 1);

  publicAPI.actions.next();
  setTimeout(() => {
    assert.equal(publicAPI.currentIndex, 2);
    assert.ok(onChange.calledOnce);

    publicAPI.actions.next();
    setTimeout(() => {
      assert.equal(publicAPI.currentIndex, 0);
      assert.ok(onChange.calledTwice);

      publicAPI.actions.prev();
      setTimeout(() => {
        assert.equal(publicAPI.currentIndex, 2);
        assert.ok(onChange.calledThrice);

        done();
      }, 500);
    }, 500);
  }, 500);
});

test('dynamically adding and removing tabs', function(assert) {
  const doRegister = sinon.spy(),
    done = assert.async();
  this.setProperties({ doRegister, shouldRemove: false, shouldAdd: false });

  this.render(hbs`
    {{#tab-container startIndex=1 doRegister=doRegister as |tabContainer|}}
      {{tab-container/item doRegister=tabContainer.actions.register
        onDestroy=tabContainer.actions.unregister}}
      {{#if (not shouldRemove)}}
        {{tab-container/item doRegister=tabContainer.actions.register
          onDestroy=tabContainer.actions.unregister}}
      {{/if}}
      {{#if shouldAdd}}
        {{tab-container/item doRegister=tabContainer.actions.register
          onDestroy=tabContainer.actions.unregister}}
      {{/if}}
    {{/tab-container}}
  `);

  assert.ok(this.$('.tab-container').length, 'did render');
  assert.ok(doRegister.calledOnce);
  assert.equal(this.$('.tab-container-item').length, 2, 'two tabs');

  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.currentIndex, 1);

  this.set('shouldRemove', true);
  wait()
    .then(() => {
      assert.equal(this.$('.tab-container-item').length, 1, 'one tab');
      assert.equal(publicAPI.currentIndex, 0, 'index is also adjusted');

      this.set('shouldAdd', true);
      return wait();
    })
    .then(() => {
      assert.equal(this.$('.tab-container-item').length, 2, 'two tabs again');
      assert.equal(publicAPI.currentIndex, 0, 'index is not adjusted');

      done();
    });
});
