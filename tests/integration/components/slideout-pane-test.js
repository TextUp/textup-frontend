import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { typeOf, tryInvoke } = Ember;

moduleForComponent('slideout-pane', 'Integration | Component | slideout pane', {
  integration: true,
  beforeEach() {
    Ember.getOwner(this).register(
      'component:slideout-pane-test',
      Ember.Component.extend({
        init() {
          this._super(...arguments);
          tryInvoke(this, 'doRegister', [this]);
        },
      })
    );
  },
});

test('inputs', function(assert) {
  this.setProperties({ fn: sinon.spy(), direction: Constants.SLIDEOUT.DIRECTION.RIGHT });

  assert.throws(() => this.render(hbs`{{slideout-pane}}`));

  this.render(hbs`
  {{slideout-pane onClose=fn
    doRegister=fn
    headerComponent=(component "slideout-pane-test")
    footerComponent=(component "slideout-pane-test")
    bodyClass="hi"
    direction=direction
    ignoreCloseSelectors="hi"
    clickOutToClose=true
    focusDelay=888
    focusSelector="hi"
    forceKeepOpen=true
    onOpen=fn}}
`);
  assert.ok(this.$('.slideout-pane').length, 'did render');

  assert.throws(() => this.render(hbs`{{slideout-pane onClose=fn direction="invalid"}}`));
});

test('adding custom class to body', function(assert) {
  const onClose = sinon.spy(),
    bodyClass = 'test-slideout-body-class';
  this.setProperties({ onClose, bodyClass });

  this.render(hbs`{{slideout-pane onClose=onClose bodyClass=bodyClass}}`);
  assert.ok(this.$('.slideout-pane').length, 'did render');
  assert.ok(this.$('.slideout-pane__body.' + bodyClass).length, 'has body class');
});

test('slideout direction', function(assert) {
  const onClose = sinon.spy(),
    done = assert.async();
  this.setProperties({ onClose, direction: Constants.SLIDEOUT.DIRECTION.RIGHT });

  this.render(hbs`{{slideout-pane onClose=onClose direction=direction}}`);
  assert.ok(this.$('.slideout-pane').length, 'did render');
  assert.ok(
    this.$('.slideout-pane--direction-' + Constants.SLIDEOUT.DIRECTION.RIGHT).length,
    'has `right` direction class'
  );
  assert.notOk(
    this.$('.slideout-pane--direction-' + Constants.SLIDEOUT.DIRECTION.LEFT).length,
    'does not have `left` direction class'
  );

  this.set('direction', Constants.SLIDEOUT.DIRECTION.LEFT);
  wait().then(() => {
    assert.notOk(
      this.$('.slideout-pane--direction-' + Constants.SLIDEOUT.DIRECTION.RIGHT).length,
      'does not have `right` direction class'
    );
    assert.ok(
      this.$('.slideout-pane--direction-' + Constants.SLIDEOUT.DIRECTION.LEFT).length,
      'has `left` direction class'
    );

    done();
  });
});

test('focusing after open', function(assert) {
  const onClose = sinon.spy(),
    done = assert.async();
  this.setProperties({ onClose });

  this.render(hbs`{{slideout-pane onClose=onClose}}`);
  assert.ok(this.$('.slideout-pane').length, 'did render');
  assert.ok(this.$('.slideout-pane__body').length, 'has body');

  const $body = this.$('.slideout-pane__body');
  assert.notOk($body.is(window.document.activeElement), 'body is not focused');
  wait().then(() => {
    assert.ok($body.is(window.document.activeElement), 'after delay, body is focused');

    done();
  });
});

test('on open handler', function(assert) {
  const onClose = sinon.spy(),
    onOpen = sinon.spy();
  this.setProperties({ onClose, onOpen });

  this.render(hbs`{{slideout-pane onClose=onClose onOpen=onOpen}}`);
  assert.ok(this.$('.slideout-pane').length, 'did render');
  assert.ok(onOpen.calledOnce, 'this component is immediately opened');
});

test('rendering header and footer components', function(assert) {
  const onClose = sinon.spy(),
    headerRegister = sinon.spy(),
    footerRegister = sinon.spy(),
    done = assert.async();
  this.setProperties({ onClose, headerRegister, footerRegister });

  this.render(hbs`
    {{slideout-pane onClose=onClose
      headerComponent=(component "slideout-pane-test" doRegister=headerRegister)
      footerComponent=(component "slideout-pane-test" doRegister=footerRegister)}}
  `);
  assert.ok(this.$('.slideout-pane').length, 'did render');
  assert.ok(onClose.notCalled);
  assert.ok(headerRegister.calledOnce);
  assert.ok(footerRegister.calledOnce);
  assert.equal(
    typeOf(headerRegister.firstCall.args[0].onClose),
    'function',
    'header is passed a close function'
  );
  assert.equal(
    typeOf(footerRegister.firstCall.args[0].onClose),
    'function',
    'footer is passed a close function'
  );

  headerRegister.firstCall.args[0].onClose.call();
  wait()
    .then(() => {
      assert.equal(onClose.callCount, 1, 'called by header');

      footerRegister.firstCall.args[0].onClose.call();
      return wait();
    })
    .then(() => {
      assert.equal(onClose.callCount, 2, 'called by footer');

      done();
    });
});

test('public API', function(assert) {
  const onClose = sinon.spy(),
    doRegister = sinon.spy();
  this.setProperties({ onClose, doRegister });

  this.render(hbs`{{slideout-pane onClose=onClose doRegister=doRegister}}`);
  assert.ok(this.$('.slideout-pane').length, 'did render');
  assert.ok(doRegister.calledOnce);
  assert.equal(typeOf(doRegister.firstCall.args[0]), 'object');
  assert.equal(typeOf(doRegister.firstCall.args[0].id), 'string');
  assert.equal(typeOf(doRegister.firstCall.args[0].isOpen), 'boolean');
  assert.equal(typeOf(doRegister.firstCall.args[0].actions.close), 'function');
});

test('rendering block with public API', function(assert) {
  const onClose = sinon.spy(),
    blockFn = sinon.spy(),
    blockClass = 'slideout-pane-block-test',
    doRegister = sinon.spy(),
    done = assert.async();
  this.setProperties({ onClose, doRegister, blockFn, blockClass });

  this.render(hbs`
    {{#slideout-pane onClose=onClose doRegister=doRegister as |slideout|}}
      <button type="button" class={{blockClass}} onclick={{action blockFn slideout}}></button>
    {{/slideout-pane}}
  `);
  assert.ok(this.$('.slideout-pane').length, 'did render');
  assert.ok(this.$('.' + blockClass).length, 'has block');
  assert.ok(doRegister.calledOnce);
  const publicAPI = doRegister.firstCall.args[0];

  this.$('.' + blockClass)
    .eq(0)
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(blockFn.calledOnce);
    assert.deepEqual(
      blockFn.firstCall.args[0],
      publicAPI,
      'block yield is the slideout public API'
    );

    done();
  });
});

test('closing via public API', function(assert) {
  const onClose = sinon.spy(),
    doRegister = sinon.spy(),
    done = assert.async();
  this.setProperties({ onClose, doRegister });

  this.render(hbs`{{slideout-pane onClose=onClose doRegister=doRegister}}`);
  assert.ok(this.$('.slideout-pane').length, 'did render');
  assert.ok(this.$('.slideout-pane--open').length, 'is open');
  assert.ok(doRegister.calledOnce);
  assert.ok(onClose.notCalled);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isOpen, true, 'is open');

  publicAPI.actions.close();
  wait().then(() => {
    assert.equal(publicAPI.isOpen, false, 'not open');
    assert.ok(onClose.calledOnce);
    assert.notOk(this.$('.slideout-pane--open').length, 'not open');

    done();
  });
});

test('clicking out to close slideout', function(assert) {
  const onClose = sinon.spy(),
    doRegister = sinon.spy(),
    done = assert.async();
  this.setProperties({ onClose, doRegister, clickOutToClose: false });

  this.render(hbs`
    <div class="test-external-item"></div>
    {{slideout-pane onClose=onClose doRegister=doRegister clickOutToClose=clickOutToClose}}
  `);
  assert.ok(this.$('.slideout-pane').length, 'did render');
  assert.ok(this.$('.slideout-pane--open').length, 'is open');
  assert.ok(doRegister.calledOnce);
  assert.ok(onClose.notCalled);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isOpen, true, 'is open');

  this.$('.test-external-item').click();
  wait()
    .then(() => {
      assert.ok(
        this.$('.slideout-pane--open').length,
        'still open because `clickOutToClose` is false'
      );
      assert.equal(publicAPI.isOpen, true);
      assert.ok(onClose.notCalled);

      this.set('clickOutToClose', true);
      return wait();
    })
    .then(() => {
      this.$('.test-external-item').click();
      return wait();
    })
    .then(() => {
      assert.notOk(this.$('.slideout-pane--open').length, 'not open');
      assert.equal(publicAPI.isOpen, false);
      assert.ok(onClose.calledOnce);

      done();
    });
});

test('ignore certain selectors and children of the component when clicking to close', function(assert) {
  const onClose = sinon.spy(),
    doRegister = sinon.spy(),
    done = assert.async();
  this.setProperties({ onClose, doRegister });

  this.render(hbs`
    <div class="test-external-item-1"></div>
    {{#slideout-pane onClose=onClose
      doRegister=doRegister
      ignoreCloseSelectors=".test-external-item-1"}}
      <div class="test-internal-item-1"></div>
    {{/slideout-pane}}
  `);
  assert.ok(this.$('.slideout-pane').length, 'did render');
  assert.ok(this.$('.slideout-pane--open').length, 'is open');
  assert.ok(this.$('.slideout-pane__overlay').length, 'has overlay');
  assert.ok(doRegister.calledOnce);
  assert.ok(onClose.notCalled);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isOpen, true, 'is open');

  this.$('.test-external-item-1').click();
  wait()
    .then(() => {
      assert.ok(this.$('.slideout-pane--open').length, 'still open because this is ignored');
      assert.equal(publicAPI.isOpen, true);
      assert.ok(this.$('.slideout-pane__overlay').length, 'has overlay');
      assert.ok(onClose.notCalled);

      this.$('.test-internal-item-1').click();
      return wait();
    })
    .then(() => {
      assert.ok(
        this.$('.slideout-pane--open').length,
        'still open because this is a child element'
      );
      assert.equal(publicAPI.isOpen, true);
      assert.ok(this.$('.slideout-pane__overlay').length, 'has overlay');
      assert.ok(onClose.notCalled);

      this.$('.slideout-pane__overlay').click();
      return wait();
    })
    .then(() => {
      assert.notOk(this.$('.slideout-pane--open').length, 'not open');
      assert.equal(publicAPI.isOpen, false);
      assert.notOk(this.$('.slideout-pane__overlay').length, 'no overlay when closed');
      assert.ok(onClose.calledOnce);

      done();
    });
});

test('forcing slideout to remain open even when trying to close', function(assert) {
  const onClose = sinon.spy(),
    doRegister = sinon.spy(),
    done = assert.async();
  this.setProperties({ onClose, doRegister, forceKeepOpen: true });

  this.render(hbs`
    <div class="test-external-item"></div>
    {{slideout-pane onClose=onClose doRegister=doRegister forceKeepOpen=forceKeepOpen}}
  `);
  assert.ok(this.$('.slideout-pane').length, 'did render');
  assert.ok(this.$('.slideout-pane--open').length, 'is open');
  assert.ok(this.$('.slideout-pane--keep-open').length, 'force keep open');
  assert.ok(doRegister.calledOnce);
  assert.ok(onClose.notCalled);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isOpen, true, 'is open');

  $('.test-external-item').click();
  wait()
    .then(() => {
      assert.ok(this.$('.slideout-pane--open').length, 'is open');
      assert.equal(publicAPI.isOpen, true, 'is open');
      assert.ok(onClose.notCalled);

      this.set('forceKeepOpen', false);
      return wait();
    })
    .then(() => {
      assert.notOk(this.$('.slideout-pane--keep-open').length, 'no longer force keep open');

      $('.test-external-item').click();
      return wait();
    })
    .then(() => {
      assert.notOk(this.$('.slideout-pane--open').length, 'not open');
      assert.equal(publicAPI.isOpen, false);
      assert.ok(onClose.calledOnce);

      done();
    });
});

test('public API close overrides force keep slideout open', function(assert) {
  const onClose = sinon.spy(),
    doRegister = sinon.spy(),
    done = assert.async();
  this.setProperties({ onClose, doRegister, forceKeepOpen: true });

  this.render(hbs`
    <div class="test-external-item"></div>
    {{slideout-pane onClose=onClose doRegister=doRegister forceKeepOpen=forceKeepOpen}}
  `);
  assert.ok(this.$('.slideout-pane').length, 'did render');
  assert.ok(this.$('.slideout-pane--open').length, 'is open');
  assert.ok(this.$('.slideout-pane--keep-open').length, 'force keep open');
  assert.ok(doRegister.calledOnce);
  assert.ok(onClose.notCalled);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isOpen, true, 'is open');

  publicAPI.actions.close();
  wait().then(() => {
    assert.notOk(this.$('.slideout-pane--open').length, 'not open');
    assert.equal(publicAPI.isOpen, false);
    assert.ok(onClose.calledOnce);

    done();
  });
});
