import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { typeOf } = Ember;

moduleForComponent('hide-show', 'Integration | Component | hide show', {
  integration: true,
});

test('properties', function(assert) {
  this.render(hbs`{{hide-show}}`);

  assert.ok(this.$('.ember-view').length);

  this.setProperties({ func: () => null });
  this.render(hbs`
    {{hide-show doRegister=func
      onOpen=func
      onClose=func
      focusOnOpenSelector=".hi"
      startOpen=false
      clickOutToClose=false
      ignoreCloseSelector=".hi"
      focusOutToClose=false
      animate=true
      disabled=false}}
  `);

  assert.ok(this.$('.ember-view').length);

  assert.throws(() => {
    this.render(hbs`
      {{hide-show doRegister="hi"
        onOpen=88
        onClose=88
        focusOnOpenSelector=88
        startOpen=88
        clickOutToClose=88
        ignoreCloseSelector=88
        focusOutToClose=88
        animate=88
        disabled=88}}
    `);
  });
});

test('registering + calling event handlers', function(assert) {
  const doRegister = sinon.spy(),
    onOpen = sinon.spy(),
    onClose = sinon.spy(),
    done = assert.async();
  this.setProperties({ doRegister, onOpen, onClose });

  this.render(hbs`{{hide-show doRegister=doRegister onOpen=onOpen onClose=onClose}}`);

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
  assert.equal(publicAPI.isOpen, false);
  publicAPI.actions
    .open()
    .then(() => {
      assert.equal(publicAPI.isOpen, true);

      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.notCalled);

      return publicAPI.actions.close();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, false);

      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.calledOnce);

      return publicAPI.actions.toggle();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, true);

      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledTwice);
      assert.ok(onClose.calledOnce);

      return publicAPI.actions.toggle();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, false);

      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledTwice);
      assert.ok(onClose.calledTwice);

      done();
    });
});

test('public API close then call', function(assert) {
  const doRegister = sinon.spy(),
    onClose = sinon.spy(),
    customAction = sinon.spy(),
    done = assert.async(),
    arg1 = Math.random(),
    arg2 = Math.random();
  this.setProperties({ doRegister, onClose });

  this.render(hbs`{{hide-show doRegister=doRegister onClose=onClose}}`);

  assert.ok(this.$('.ember-view').length);
  assert.ok(doRegister.calledOnce);

  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(typeOf(publicAPI.actions.closeThenCall), 'function');

  publicAPI.actions
    .open()
    .then(() => {
      assert.ok(doRegister.calledOnce);
      assert.ok(onClose.notCalled);
      assert.ok(customAction.notCalled);

      return publicAPI.actions.closeThenCall(customAction, arg1, arg2);
    })
    .then(() => {
      assert.ok(doRegister.calledOnce);
      assert.ok(onClose.calledOnce);
      assert.ok(customAction.calledOnce);
      assert.ok(customAction.calledWith(arg1, arg2));

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

test('disabled state', function(assert) {
  const done = assert.async(),
    doRegister = sinon.spy();

  this.setProperties({ doRegister, disabled: true });
  this.render(hbs`{{hide-show doRegister=doRegister disabled=disabled}}`);

  assert.ok(this.$('.ember-view').length);
  assert.ok(doRegister.calledOnce);

  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isOpen, false);

  publicAPI.actions
    .open()
    .then(() => {
      assert.equal(publicAPI.isOpen, false);

      this.set('disabled', false);
      return publicAPI.actions.open();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, true);

      this.set('disabled', true);
      return publicAPI.actions.close();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, true);

      this.set('disabled', false);
      return publicAPI.actions.close();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, false);

      done();
    });
});

test('opening and closing + focusing on selector after opening', function(assert) {
  const bodyText = `${Math.random()}`,
    focusOnOpenSelector = '.start-focus',
    done = assert.async();
  this.setProperties({ bodyText, focusOnOpenSelector });

  this.render(hbs`
    {{#hide-show doRegister=doRegister focusOnOpenSelector=focusOnOpenSelector as |hideShow|}}
      <button type="button" onclick={{hideShow.actions.toggle}}></button>
      {{#if hideShow.isOpen}}
        <input type="text" class="start-focus" />
        {{bodyText}}
      {{/if}}
    {{/hide-show}}
  `);

  assert.ok(this.$('.ember-view').length);
  assert.ok(
    this.$()
      .text()
      .indexOf(bodyText) === -1,
    'body text not shown'
  );

  this.$('.ember-view button')
    .first()
    .triggerHandler('click');
  wait()
    .then(() => {
      assert.ok(
        this.$()
          .text()
          .indexOf(bodyText) > -1,
        'body text shows'
      );
      assert.ok(this.$(focusOnOpenSelector).is(document.activeElement));

      this.$('.ember-view button')
        .first()
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok(
        this.$()
          .text()
          .indexOf(bodyText) === -1,
        'body text not shown'
      );

      done();
    });
});

test('starting open + focus on open', function(assert) {
  const bodyText = `${Math.random()}`,
    focusOnOpenSelector = '.start-focus',
    done = assert.async();
  this.setProperties({ bodyText, focusOnOpenSelector });

  this.render(hbs`
    {{#hide-show startOpen=true focusOnOpenSelector=focusOnOpenSelector as |hideShow|}}
      <button type="button" onclick={{hideShow.actions.toggle}}></button>
      {{#if hideShow.isOpen}}
        <input type="text" class="start-focus" />
        {{bodyText}}
      {{/if}}
    {{/hide-show}}
  `);

  assert.ok(this.$('.ember-view').length);

  wait().then(() => {
    assert.ok(
      this.$()
        .text()
        .indexOf(bodyText) > -1,
      'body text is shown'
    );
    assert.ok(this.$(focusOnOpenSelector).is(document.activeElement));

    done();
  });
});

test('clicking out to close + ignored selectors', function(assert) {
  const bodyText = `${Math.random()}`,
    ignoreCloseSelector = '.ignore-this',
    done = assert.async();
  this.setProperties({ bodyText, ignoreCloseSelector });

  this.render(hbs`
    <div class="ignore-this">
      <p>Do not close if this div is clicked</p>
    </div>
    <div class="close-if-clicked">
      <p>Selecting this will close the hide-show</p>
    </div>
    {{#hide-show startOpen=true clickOutToClose=true ignoreCloseSelector=ignoreCloseSelector as |hideShow|}}
      <button type="button" onclick={{hideShow.actions.toggle}}></button>
      {{#if hideShow.isOpen}}
        {{bodyText}}
      {{/if}}
    {{/hide-show}}
  `);

  assert.ok(this.$('.ember-view').length);
  assert.ok(
    this.$()
      .text()
      .indexOf(bodyText) > -1,
    'body text is shown'
  );
  assert.ok(Ember.$(ignoreCloseSelector).length);

  Ember.$(ignoreCloseSelector)
    .children()
    .first()
    .click();
  wait()
    .then(() => {
      assert.ok(
        this.$()
          .text()
          .indexOf(bodyText) > -1,
        'still open'
      );
      assert.ok(Ember.$('.close-if-clicked').length);

      Ember.$('.close-if-clicked')
        .children()
        .first()
        .click();
      return wait();
    })
    .then(() => {
      assert.ok(
        this.$()
          .text()
          .indexOf(bodyText) === -1,
        'now closed'
      );

      done();
    });
});

test('closing when focusing out of this element', function(assert) {
  const done = assert.async(),
    onOpen = sinon.spy(),
    onClose = sinon.spy();

  this.setProperties({ onOpen, onClose });
  this.render(hbs`
    <div tabindex="-1" class="external-element"></div>
    {{#hide-show focusOutToClose=true onOpen=onOpen onClose=onClose as |hideShow|}}
      <button type="button" onclick={{hideShow.actions.open}}>Open</button>
      <div tabindex="-1" class="internal-element"></div>
    {{/hide-show}}
  `);

  assert.ok(this.$('.ember-view').length);
  assert.ok(this.$('.ember-view button').length);

  this.$('.ember-view button')
    .first()
    .triggerHandler('click');
  wait()
    .then(() => {
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.notCalled);

      assert.ok(this.$('.ember-view .internal-element').length);
      this.$('.ember-view .internal-element').focus();
      return wait();
    })
    .then(() => {
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.notCalled);

      assert.ok(Ember.$('.external-element').length);
      Ember.$('.external-element').focus();
      return wait();
    })
    .then(() => {
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.calledOnce);

      done();
    });
});

test('closing due to touch event', function(assert) {
  const done = assert.async(),
    onOpen = sinon.spy(),
    onClose = sinon.spy(),
    touchIdent = Math.random(),
    $touchTarget = Ember.$('#ember-testing');

  this.setProperties({ onOpen, onClose });
  this.render(hbs`
    {{#hide-show clickOutToClose=true onOpen=onOpen onClose=onClose as |hideShow|}}
      <button type="button" onclick={{hideShow.actions.open}}>Open</button>
    {{/hide-show}}
  `);

  assert.ok(this.$('.ember-view').length);
  assert.ok(this.$('.ember-view button').length);

  this.$('.ember-view button')
    .first()
    .triggerHandler('click');
  wait()
    .then(() => {
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.notCalled);

      $touchTarget.trigger(Ember.$.Event('touchstart', buildTouchEvent(touchIdent, 0, 0)));

      return wait();
    })
    .then(() => {
      $touchTarget.trigger(Ember.$.Event('touchend', buildTouchEvent(touchIdent, 80, 0)));

      return wait();
    })
    .then(() => {
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.notCalled, 'touch distance too far, only close on tap not drag');

      $touchTarget.trigger(Ember.$.Event('touchstart', buildTouchEvent(touchIdent, 0, 0)));

      return wait();
    })
    .then(() => {
      $touchTarget.trigger(Ember.$.Event('touchend', buildTouchEvent(touchIdent, 3, 0)));

      return wait();
    })
    .then(() => {
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.calledOnce);

      done();
    });
});

test('turning animation (via liquid-spacer) on and off', function(assert) {
  const done = assert.async();
  this.setProperties({ animate: false });

  this.render(hbs`{{hide-show}}`);

  assert.ok(this.$('.ember-view').length, 'did render');
  assert.ok(this.$('.ember-view .hide-show').length, 'by default, will animate');

  this.render(hbs`{{hide-show animate=animate}}`);

  assert.ok(this.$('.ember-view').length, 'did render');
  assert.notOk(this.$('.ember-view .hide-show').length, 'if not animate, nested inner div is gone');

  this.set('animate', true);
  wait().then(() => {
    assert.ok(this.$('.ember-view .hide-show').length, 'if animate, nested inner div is present');

    done();
  });
});

function buildTouchEvent(identifier, screenX, screenY) {
  return { originalEvent: { changedTouches: [{ identifier, screenX, screenY }] } };
}
