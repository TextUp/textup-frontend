import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { typeOf } = Ember;

moduleForComponent(
  'infinite-scroll/scroll-container',
  'Integration | Component | infinite scroll/scroll container',
  { integration: true }
);

test('inputs', function(assert) {
  this.setProperties({ fn: () => null, direction: Constants.INFINITE_SCROLL.DIRECTION.UP });

  this.render(hbs`{{infinite-scroll/scroll-container}}`);
  assert.ok(this.$('.infinite-scroll__scroll-container').length, 'did render');

  this.render(
    hbs`{{infinite-scroll/scroll-container direction=direction doRegister=fn onNearEnd=fn disabled=false contentClass="hi"}}`
  );
  assert.ok(this.$('.infinite-scroll__scroll-container').length, 'did render');

  assert.throws(() => {
    this.render(
      hbs`{{infinite-scroll/scroll-container direction=fn doRegister="hi" onNearEnd="hi" disabled="hi" contentClass=true}}`
    );
  });
});

test('registering', function(assert) {
  const doRegister = sinon.spy();
  this.setProperties({ doRegister });

  this.render(hbs`{{infinite-scroll/scroll-container doRegister=doRegister}}`);

  assert.ok(this.$('.infinite-scroll__scroll-container').length, 'did render');
  assert.ok(doRegister.calledOnce);
  assert.equal(doRegister.firstCall.args.length, 1);

  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(typeOf(publicAPI.isAtStart), 'boolean');
  assert.equal(typeOf(publicAPI.actions.checkNearEnd), 'function');
  assert.equal(typeOf(publicAPI.actions.resetPosition), 'function');
  assert.equal(typeOf(publicAPI.actions.restoreUserPosition), 'function');
});

test('applying custom class on content container', function(assert) {
  const contentClass = 'custom-content-container-class';
  this.setProperties({ contentClass });

  this.render(hbs`{{infinite-scroll/scroll-container contentClass=contentClass}}`);
  assert.ok(this.$('.infinite-scroll__scroll-container').length, 'did render');
  assert.ok(this.$('.' + contentClass).length, 'did custom content class');
});

test('scrolling down no overflow + notifying near edge', function(assert) {
  const doRegister = sinon.spy(),
    onNearEnd = sinon.spy(),
    contentPxHeight = 10;
  this.setProperties({
    doRegister,
    onNearEnd,
    direction: Constants.INFINITE_SCROLL.DIRECTION.DOWN,
    contentPxHeight,
  });

  this.render(hbs`
    {{#infinite-scroll/scroll-container direction=direction
      doRegister=doRegister
      onNearEnd=onNearEnd}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
    {{/infinite-scroll/scroll-container}}
  `);
  assert.ok(this.$('.infinite-scroll__scroll-container').length, 'did render');
  assert.ok(this.$('.infinite-scroll__scroll-container__content').length, 'did render');

  const $container = this.$('.infinite-scroll__scroll-container'),
    $content = this.$('.infinite-scroll__scroll-container__content');
  assert.equal($container.scrollTop(), 0);
  assert.equal($content.outerHeight(), contentPxHeight);
  assert.ok(doRegister.calledOnce);
  assert.ok(onNearEnd.calledOnce);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isAtStart, true);
});

test('scrolling down with overflow + notifying near edge', function(assert) {
  const doRegister = sinon.spy(),
    onNearEnd = sinon.spy(),
    contentPxHeight = 2888,
    done = assert.async();
  this.setProperties({
    doRegister,
    onNearEnd,
    direction: Constants.INFINITE_SCROLL.DIRECTION.DOWN,
    contentPxHeight,
  });

  this.render(hbs`
    {{#infinite-scroll/scroll-container direction=direction
      doRegister=doRegister
      onNearEnd=onNearEnd}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
    {{/infinite-scroll/scroll-container}}
  `);
  assert.ok(this.$('.infinite-scroll__scroll-container').length, 'did render');
  assert.ok(this.$('.infinite-scroll__scroll-container__content').length, 'did render');

  const $container = this.$('.infinite-scroll__scroll-container'),
    $content = this.$('.infinite-scroll__scroll-container__content');
  assert.equal($container.scrollTop(), 0);
  assert.equal($content.outerHeight(), contentPxHeight);
  assert.ok(doRegister.calledOnce);
  assert.ok(onNearEnd.notCalled, 'not near edge');
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isAtStart, true);

  $container.scrollTop(contentPxHeight / 2);
  setTimeout(() => {
    assert.ok(onNearEnd.notCalled);
    assert.equal(publicAPI.isAtStart, false);

    $container.scrollTop(contentPxHeight);
    setTimeout(() => {
      assert.equal(onNearEnd.callCount, 1);
      assert.equal(publicAPI.isAtStart, false);

      $container.scrollTop(contentPxHeight / 2);
      setTimeout(() => {
        assert.equal(onNearEnd.callCount, 1);
        assert.equal(publicAPI.isAtStart, false);

        $container.scrollTop(0);
        setTimeout(() => {
          assert.equal(onNearEnd.callCount, 1);
          assert.equal(publicAPI.isAtStart, true);

          done();
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
});

test('scrolling up no overflow + notifying near edge', function(assert) {
  const doRegister = sinon.spy(),
    onNearEnd = sinon.spy(),
    contentPxHeight = 10;
  this.setProperties({
    doRegister,
    onNearEnd,
    direction: Constants.INFINITE_SCROLL.DIRECTION.UP,
    contentPxHeight,
  });

  this.render(hbs`
    {{#infinite-scroll/scroll-container direction=direction
      doRegister=doRegister
      onNearEnd=onNearEnd}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
    {{/infinite-scroll/scroll-container}}
  `);
  assert.ok(this.$('.infinite-scroll__scroll-container').length, 'did render');
  assert.ok(this.$('.infinite-scroll__scroll-container__content').length, 'did render');

  const $container = this.$('.infinite-scroll__scroll-container'),
    $content = this.$('.infinite-scroll__scroll-container__content');
  assert.equal($content.outerHeight(), contentPxHeight);
  assert.equal($container.scrollTop(), 0);
  assert.ok(doRegister.calledOnce);
  assert.ok(onNearEnd.calledOnce);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isAtStart, true);
});

test('scrolling up with overflow + notifying near edge', function(assert) {
  const doRegister = sinon.spy(),
    onNearEnd = sinon.spy(),
    contentPxHeight = 2888,
    done = assert.async();
  this.setProperties({
    doRegister,
    onNearEnd,
    direction: Constants.INFINITE_SCROLL.DIRECTION.UP,
    contentPxHeight,
  });

  this.render(hbs`
    {{#infinite-scroll/scroll-container direction=direction
      doRegister=doRegister
      onNearEnd=onNearEnd}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
    {{/infinite-scroll/scroll-container}}
  `);
  assert.ok(this.$('.infinite-scroll__scroll-container').length, 'did render');
  assert.ok(this.$('.infinite-scroll__scroll-container__content').length, 'did render');

  const $container = this.$('.infinite-scroll__scroll-container'),
    $content = this.$('.infinite-scroll__scroll-container__content');
  assert.equal($content.outerHeight(), contentPxHeight);
  assert.equal($container.scrollTop(), $content.outerHeight() - $container.height());
  assert.ok(doRegister.calledOnce);
  assert.ok(onNearEnd.notCalled);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isAtStart, true);

  $container.scrollTop(contentPxHeight / 2);
  setTimeout(() => {
    assert.ok(onNearEnd.notCalled);
    assert.equal(publicAPI.isAtStart, false);

    $container.scrollTop(0);
    setTimeout(() => {
      assert.ok(onNearEnd.calledOnce);
      assert.equal(publicAPI.isAtStart, false);

      $container.scrollTop(contentPxHeight / 2);
      setTimeout(() => {
        assert.ok(onNearEnd.calledOnce);
        assert.equal(publicAPI.isAtStart, false);

        $container.scrollTop(contentPxHeight);
        setTimeout(() => {
          assert.ok(onNearEnd.calledOnce);
          assert.equal(publicAPI.isAtStart, true);

          done();
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
});

test('disabled', function(assert) {
  const doRegister = sinon.spy(),
    onNearEnd = sinon.spy(),
    contentPxHeight = 2888,
    done = assert.async();
  this.setProperties({
    doRegister,
    onNearEnd,
    direction: Constants.INFINITE_SCROLL.DIRECTION.UP,
    contentPxHeight,
    disabled: true,
  });

  this.render(hbs`
    {{#infinite-scroll/scroll-container disabled=disabled
      direction=direction
      doRegister=doRegister
      onNearEnd=onNearEnd}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
    {{/infinite-scroll/scroll-container}}
  `);
  assert.ok(this.$('.infinite-scroll__scroll-container').length, 'did render');
  assert.ok(this.$('.infinite-scroll__scroll-container--disabled').length, 'is disabled');
  assert.ok(this.$('.infinite-scroll__scroll-container__content').length, 'did render');

  const $container = this.$('.infinite-scroll__scroll-container'),
    $content = this.$('.infinite-scroll__scroll-container__content');
  assert.equal($content.outerHeight(), contentPxHeight);
  assert.equal($container.scrollTop(), contentPxHeight - $container.height());
  assert.ok(doRegister.calledOnce);
  assert.ok(onNearEnd.notCalled);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isAtStart, true);

  $container.scrollTop(10);
  setTimeout(() => {
    assert.ok(onNearEnd.notCalled, 'near end handler NOT called because disabled');

    this.set('disabled', false);
    setTimeout(() => {
      assert.notOk(this.$('.infinite-scroll__scroll-container--disabled').length, 'not disabled');

      setTimeout(() => {
        $container.scrollTop(0);
        wait().then(() => {
          assert.ok(onNearEnd.calledOnce, 'near end handler IS called when NOT disabled');

          done();
        });
      }, 1000);
    }, 1000);
  }, 1000);
});

test('using public API position methods when scrolling down', function(assert) {
  const doRegister = sinon.spy(),
    contentPxHeight = 2888,
    newScrollPxPosition = 1000,
    done = assert.async();
  this.setProperties({
    doRegister,
    direction: Constants.INFINITE_SCROLL.DIRECTION.DOWN,
    shouldAdd: false,
    contentPxHeight,
  });

  this.render(hbs`
    {{#infinite-scroll/scroll-container direction=direction
      doRegister=doRegister}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
      {{#if shouldAdd}}
        <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
      {{/if}}
    {{/infinite-scroll/scroll-container}}
  `);
  assert.ok(this.$('.infinite-scroll__scroll-container').length, 'did render');
  assert.ok(this.$('.infinite-scroll__scroll-container__content').length, 'did render');

  const $container = this.$('.infinite-scroll__scroll-container'),
    $content = this.$('.infinite-scroll__scroll-container__content');
  assert.equal($container.scrollTop(), 0);
  assert.equal($content.outerHeight(), contentPxHeight);
  assert.ok(doRegister.calledOnce);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isAtStart, true);

  $container.scrollTop(newScrollPxPosition);
  // to allow scroll handler to finish storing user offset
  setTimeout(() => {
    assert.equal(publicAPI.isAtStart, false);

    this.set('shouldAdd', true);
    wait()
      .then(publicAPI.actions.restoreUserPosition)
      .then(() => {
        assert.equal($container.scrollTop(), newScrollPxPosition);

        return publicAPI.actions.resetPosition();
      })
      .then(() => {
        assert.equal($container.scrollTop(), 0);

        done();
      });
  }, 1000);
});

test('using public API position methods when scrolling up', function(assert) {
  const doRegister = sinon.spy(),
    contentPxHeight = 2888,
    newScrollPxPosition = 100,
    done = assert.async();
  this.setProperties({
    doRegister,
    direction: Constants.INFINITE_SCROLL.DIRECTION.UP,
    shouldAdd: false,
    contentPxHeight,
  });

  this.render(hbs`
    {{#infinite-scroll/scroll-container direction=direction
      doRegister=doRegister}}
      {{#if shouldAdd}}
        <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
      {{/if}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
    {{/infinite-scroll/scroll-container}}
  `);
  assert.ok(this.$('.infinite-scroll__scroll-container').length, 'did render');
  assert.ok(this.$('.infinite-scroll__scroll-container__content').length, 'did render');

  const $container = this.$('.infinite-scroll__scroll-container'),
    $content = this.$('.infinite-scroll__scroll-container__content');
  assert.equal($content.outerHeight(), contentPxHeight);
  assert.equal($container.scrollTop(), $content.outerHeight() - $container.height());
  assert.ok(doRegister.calledOnce);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isAtStart, true);

  $container.scrollTop(newScrollPxPosition);
  // to allow scroll handler to finish storing user offset
  setTimeout(() => {
    assert.equal(publicAPI.isAtStart, false);

    this.set('shouldAdd', true);
    wait()
      .then(publicAPI.actions.restoreUserPosition)
      .then(() => {
        // stored user position when scrolling up is the distance relative to the bottom of the content
        assert.equal($container.scrollTop(), newScrollPxPosition + contentPxHeight);

        return publicAPI.actions.resetPosition();
      })
      .then(() => {
        assert.equal($container.scrollTop(), $content.outerHeight() - $container.height());

        done();
      });
  }, 1000);
});

test('manually triggering check if near end via public API', function(assert) {
  const doRegister = sinon.spy(),
    onNearEnd = sinon.spy(),
    contentPxHeight = 10,
    done = assert.async();
  this.setProperties({ doRegister, onNearEnd, contentPxHeight });

  this.render(hbs`
    {{#infinite-scroll/scroll-container doRegister=doRegister onNearEnd=onNearEnd}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
    {{/infinite-scroll/scroll-container}}
  `);
  assert.ok(this.$('.infinite-scroll__scroll-container').length, 'did render');
  assert.ok(this.$('.infinite-scroll__scroll-container__content').length, 'did render');
  assert.ok(onNearEnd.calledOnce);
  assert.ok(doRegister.calledOnce);
  const publicAPI = doRegister.firstCall.args[0];

  publicAPI.actions.checkNearEnd();
  wait().then(() => {
    assert.ok(
      onNearEnd.calledTwice,
      'near end check is manually triggered again + calls handler because is still near the end'
    );

    done();
  });
});
