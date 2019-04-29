import * as PullToRefreshComponent from 'textup-frontend/components/infinite-scroll/pull-to-refresh';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { typeOf, RSVP } = Ember;

moduleForComponent(
  'infinite-scroll/pull-to-refresh',
  'Integration | Component | infinite scroll/pull to refresh',
  {
    integration: true,
  }
);

test('inputs', function(assert) {
  this.setProperties({ direction: Constants.INFINITE_SCROLL.DIRECTION.DOWN, fn: () => null });

  this.render(hbs`{{infinite-scroll/pull-to-refresh}}`);
  assert.ok(this.$('.infinite-scroll__pull-to-refresh').length, 'did render');

  this.render(hbs`
    {{infinite-scroll/pull-to-refresh direction=direction
      disabled=true
      doRegister=fn
      onRefresh=fn
      refreshMessage="hi"}}
  `);
  assert.ok(this.$('.infinite-scroll__pull-to-refresh').length, 'did render');

  assert.throws(() => {
    this.render(hbs`
      {{infinite-scroll/pull-to-refresh direction="hi"
        disabled="hi"
        doRegister="hi"
        onRefresh="hi"
        refreshMessage=fn}}
    `);
  });
});

test('registering publicAPI', function(assert) {
  const doRegister = sinon.spy();
  this.setProperties({ doRegister });

  this.render(hbs`{{infinite-scroll/pull-to-refresh doRegister=doRegister}}`);
  assert.ok(this.$('.infinite-scroll__pull-to-refresh').length, 'did render');

  assert.ok(doRegister.calledOnce);
  assert.ok(doRegister.firstCall.args.length, 1);
  assert.equal(typeOf(doRegister.firstCall.args[0].isRefreshing), 'boolean');
});

test('customizing refresh message', function(assert) {
  const refreshMessage = Math.random() + '';
  this.setProperties({ refreshMessage });

  this.render(hbs`{{infinite-scroll/pull-to-refresh refreshMessage=refreshMessage}}`);
  assert.ok(this.$('.infinite-scroll__pull-to-refresh').length, 'did render');
  assert.ok(
    this.$()
      .text()
      .includes(refreshMessage),
    'custom refresh message'
  );
});

test('pulling via touch + refresh function returns a promise', function(assert) {
  const doRegister = sinon.spy(),
    onRefresh = sinon.stub(),
    done = assert.async();
  this.setProperties({ doRegister, onRefresh });

  this.render(hbs`{{infinite-scroll/pull-to-refresh doRegister=doRegister onRefresh=onRefresh}}`);
  assert.ok(this.$('.infinite-scroll__pull-to-refresh').length, 'did render');
  assert.ok(this.$('.infinite-scroll__pull-to-refresh__content').length, 'did render');
  assert.notOk(this.$('.infinite-scroll__pull-to-refresh--pulling').length, 'not pulling');
  assert.notOk(this.$('.infinite-scroll__pull-to-refresh--refreshing').length, 'not refreshing');
  assert.ok(doRegister.calledOnce);
  assert.ok(onRefresh.notCalled);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isRefreshing, false);

  let resolveFn;
  const $content = this.$('.infinite-scroll__pull-to-refresh__content');
  $content.trigger(Ember.$.Event('touchstart', touchEvent(0)));
  $content.trigger(
    Ember.$.Event('touchmove', touchEvent(PullToRefreshComponent.MAX_PULL_LENGTH_IN_PX * 5))
  );
  wait()
    .then(() => {
      assert.ok(this.$('.infinite-scroll__pull-to-refresh--pulling').length, 'is pulling');
      assert.equal(publicAPI.isRefreshing, false);
      assert.ok(onRefresh.notCalled);
      assert.equal(
        $content.attr('style'),
        `transform: translateY(${PullToRefreshComponent.MAX_PULL_LENGTH_IN_PX}px);`,
        'constrained to max allowed overscroll threshold'
      );

      onRefresh.callsFake(() => new RSVP.Promise(resolve => (resolveFn = resolve)));
      $content.trigger(Ember.$.Event('touchend'));
      return wait();
    })
    .then(() => {
      assert.notOk(this.$('.infinite-scroll__pull-to-refresh--pulling').length, 'not pulling');
      assert.equal(publicAPI.isRefreshing, true);
      assert.ok(onRefresh.calledOnce);
      assert.ok(this.$('.infinite-scroll__pull-to-refresh--refreshing').length, 'is refreshing');
      assert.ok(resolveFn, 'has resolve function');
      assert.notOk($content.attr('style'), '`style` attrib on content is removed when refreshing');

      resolveFn.call();
      return wait();
    })
    .then(() => {
      assert.equal(publicAPI.isRefreshing, false);
      assert.notOk(
        this.$('.infinite-scroll__pull-to-refresh--refreshing').length,
        'not refreshing'
      );

      done();
    });
});

test('pulling via mouse + refresh function does not return promise', function(assert) {
  const doRegister = sinon.spy(),
    onRefresh = sinon.spy(),
    done = assert.async();
  this.setProperties({ doRegister, onRefresh });

  this.render(hbs`{{infinite-scroll/pull-to-refresh doRegister=doRegister onRefresh=onRefresh}}`);
  assert.ok(this.$('.infinite-scroll__pull-to-refresh').length, 'did render');
  assert.ok(this.$('.infinite-scroll__pull-to-refresh__content').length, 'did render');
  assert.notOk(this.$('.infinite-scroll__pull-to-refresh--refreshing').length, 'not refreshing');
  assert.ok(doRegister.calledOnce);
  assert.ok(onRefresh.notCalled);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isRefreshing, false);

  const $content = this.$('.infinite-scroll__pull-to-refresh__content'),
    pullLength = PullToRefreshComponent.MIN_REQUIRED_PULL_LENGTH_IN_PX + 10;
  $content.trigger(Ember.$.Event('mousedown', mouseEvent(0)));
  $content.trigger(Ember.$.Event('mousemove', mouseEvent(pullLength)));
  wait()
    .then(() => {
      assert.equal(publicAPI.isRefreshing, false);
      assert.ok(onRefresh.notCalled);
      assert.equal(
        $content.attr('style'),
        `transform: translateY(${pullLength}px);`,
        'have not hit the max allowed overscroll threshold'
      );

      $content.trigger(Ember.$.Event('mouseup'));
      return wait();
    })
    .then(() => {
      assert.equal(
        publicAPI.isRefreshing,
        false,
        'immediately set to not refreshing if does not return promise'
      );
      assert.notOk(
        this.$('.infinite-scroll__pull-to-refresh--refreshing').length,
        'not refreshing'
      );
      assert.ok(onRefresh.calledOnce);
      assert.notOk($content.attr('style'), '`style` attrib on content is removed when not pulling');

      done();
    });
});

test('pulling up instead of down', function(assert) {
  const doRegister = sinon.spy(),
    onRefresh = sinon.spy(),
    done = assert.async();
  this.setProperties({ doRegister, onRefresh, direction: Constants.INFINITE_SCROLL.DIRECTION.UP });

  this.render(
    hbs`{{infinite-scroll/pull-to-refresh direction=direction doRegister=doRegister onRefresh=onRefresh}}`
  );
  assert.ok(this.$('.infinite-scroll__pull-to-refresh').length, 'did render');
  assert.ok(this.$('.infinite-scroll__pull-to-refresh--up').length, 'up direction');
  assert.ok(this.$('.infinite-scroll__pull-to-refresh__content').length, 'did render');
  assert.notOk(this.$('.infinite-scroll__pull-to-refresh--pulling').length, 'not pulling');
  assert.notOk(this.$('.infinite-scroll__pull-to-refresh--refreshing').length, 'not refreshing');
  assert.ok(doRegister.calledOnce);
  assert.ok(onRefresh.notCalled);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isRefreshing, false);

  const $content = this.$('.infinite-scroll__pull-to-refresh__content');
  $content.trigger(Ember.$.Event('touchstart', touchEvent(500)));
  $content.trigger(
    Ember.$.Event('touchmove', touchEvent(500 - PullToRefreshComponent.MAX_PULL_LENGTH_IN_PX))
  );
  wait()
    .then(() => {
      assert.ok(this.$('.infinite-scroll__pull-to-refresh--pulling').length, 'is pulling');
      assert.equal(publicAPI.isRefreshing, false);
      assert.ok(onRefresh.notCalled);
      assert.equal(
        $content.attr('style'),
        `transform: translateY(-${PullToRefreshComponent.MAX_PULL_LENGTH_IN_PX}px);`,
        'translate in the opposite direction because direction is up'
      );

      $content.trigger(Ember.$.Event('touchend'));
      return wait();
    })
    .then(() => {
      assert.notOk(this.$('.infinite-scroll__pull-to-refresh--pulling').length, 'not pulling');
      assert.ok(onRefresh.calledOnce, 'direction is valid');

      done();
    });
});

test('pulling insufficient distance', function(assert) {
  const doRegister = sinon.spy(),
    onRefresh = sinon.spy(),
    done = assert.async();
  this.setProperties({ doRegister, onRefresh });

  this.render(hbs`{{infinite-scroll/pull-to-refresh doRegister=doRegister onRefresh=onRefresh}}`);
  assert.ok(this.$('.infinite-scroll__pull-to-refresh').length, 'did render');
  assert.ok(this.$('.infinite-scroll__pull-to-refresh__content').length, 'did render');
  assert.notOk(this.$('.infinite-scroll__pull-to-refresh--refreshing').length, 'not refreshing');
  assert.ok(doRegister.calledOnce);
  assert.ok(onRefresh.notCalled);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isRefreshing, false);

  const $content = this.$('.infinite-scroll__pull-to-refresh__content'),
    pullLength = PullToRefreshComponent.MIN_REQUIRED_PULL_LENGTH_IN_PX - 10;
  $content.trigger(Ember.$.Event('mousedown', mouseEvent(0)));
  $content.trigger(Ember.$.Event('mousemove', mouseEvent(pullLength)));
  wait()
    .then(() => {
      assert.equal(publicAPI.isRefreshing, false);
      assert.ok(onRefresh.notCalled);
      assert.equal($content.attr('style'), `transform: translateY(${pullLength}px);`);

      $content.trigger(Ember.$.Event('mouseleave'));
      return wait();
    })
    .then(() => {
      assert.equal(publicAPI.isRefreshing, false);
      assert.ok(onRefresh.notCalled, 'does not exceed the minimum threshold');
      assert.notOk($content.attr('style'));

      done();
    });
});

test('pulling wrong direction', function(assert) {
  const onRefresh = sinon.spy(),
    done = assert.async();
  this.setProperties({ onRefresh, direction: Constants.INFINITE_SCROLL.DIRECTION.DOWN });

  this.render(hbs`{{infinite-scroll/pull-to-refresh direction=direction onRefresh=onRefresh}}`);
  assert.ok(this.$('.infinite-scroll__pull-to-refresh').length, 'did render');
  assert.ok(this.$('.infinite-scroll__pull-to-refresh__content').length, 'did render');
  assert.notOk(this.$('.infinite-scroll__pull-to-refresh--pulling').length, 'not pulling');
  assert.notOk(this.$('.infinite-scroll__pull-to-refresh--up').length, 'direction is down');
  assert.ok(onRefresh.notCalled);

  const $content = this.$('.infinite-scroll__pull-to-refresh__content');
  $content.trigger(Ember.$.Event('mousedown', mouseEvent(100)));
  $content.trigger(Ember.$.Event('mousemove', mouseEvent(0)));
  wait()
    .then(() => {
      assert.notOk(this.$('.infinite-scroll__pull-to-refresh--pulling').length, 'not pulling');
      assert.ok(onRefresh.notCalled);
      assert.notOk($content.attr('style'), 'pull is not right direction when direction is down');

      this.set('direction', Constants.INFINITE_SCROLL.DIRECTION.UP);
      return wait();
    })
    .then(() => {
      assert.ok(onRefresh.notCalled);
      assert.ok(this.$('.infinite-scroll__pull-to-refresh--up').length, 'direction is up');

      $content.trigger(Ember.$.Event('touchstart', touchEvent(0)));
      $content.trigger(Ember.$.Event('touchmove', touchEvent(100)));
      return wait();
    })
    .then(() => {
      assert.notOk(this.$('.infinite-scroll__pull-to-refresh--pulling').length, 'not pulling');
      assert.ok(onRefresh.notCalled);
      assert.notOk($content.attr('style'), 'pull is not right direction when direction is up');

      done();
    });
});

test('disabled', function(assert) {
  const onRefresh = sinon.spy(),
    done = assert.async();
  this.setProperties({ onRefresh, disabled: true });

  this.render(hbs`{{infinite-scroll/pull-to-refresh disabled=disabled onRefresh=onRefresh}}`);
  assert.ok(this.$('.infinite-scroll__pull-to-refresh').length, 'did render');
  assert.ok(this.$('.infinite-scroll__pull-to-refresh__content').length, 'did render');
  assert.ok(this.$('.infinite-scroll__pull-to-refresh--disabled').length, 'is disabled');
  assert.ok(onRefresh.notCalled);

  const $content = this.$('.infinite-scroll__pull-to-refresh__content');
  $content.trigger(Ember.$.Event('mousedown', mouseEvent(0)));
  $content.trigger(Ember.$.Event('mousemove', mouseEvent(100)));
  wait()
    .then(() => {
      assert.ok(onRefresh.notCalled);
      assert.notOk($content.attr('style'), 'pull is correct direction but is disabled');

      this.set('disabled', false);
      return wait();
    })
    .then(() => {
      assert.notOk(
        this.$('.infinite-scroll__pull-to-refresh--disabled').length,
        'no longer disabled'
      );

      done();
    });
});

function touchEvent(pageY) {
  return { originalEvent: { targetTouches: [{ pageY }] } };
}

function mouseEvent(pageY) {
  return { pageY };
}
