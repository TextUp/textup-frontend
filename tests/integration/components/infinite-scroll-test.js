import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { typeOf, RSVP, run } = Ember;

moduleForComponent('infinite-scroll', 'Integration | Component | infinite scroll', {
  integration: true,
});

test('inputs', function(assert) {
  this.setProperties({
    array: [],
    fn: () => null,
    direction: Constants.INFINITE_SCROLL.DIRECTION.UP,
  });

  this.render(hbs`{{infinite-scroll}}`);
  assert.ok(this.$('.infinite-scroll').length, 'did render');

  this.render(hbs`
    {{infinite-scroll data=array
      numTotal=88
      direction=direction
      loadMessage="hi"
      refreshMessage="hi"
      doRegister=fn
      onRefresh=fn
      onLoad=fn}}
  `);
  assert.ok(this.$('.infinite-scroll').length, 'did render');

  assert.throws(() => {
    this.render(hbs`
    {{infinite-scroll data="hi"
      numTotal="hi"
      direction="hi"
      loadMessage=array
      refreshMessage=array
      doRegister="hi"
      onRefresh="hi"
      onLoad="hi"}}
  `);
  });
});

test('customizing messages', function(assert) {
  const refreshMessage = Math.random() + '',
    loadMessage = Math.random() + '';
  this.setProperties({ refreshMessage, loadMessage });

  this.render(hbs`{{infinite-scroll refreshMessage=refreshMessage loadMessage=loadMessage}}`);
  assert.ok(this.$('.infinite-scroll').length, 'did render');

  assert.ok(
    this.$('.infinite-scroll__loading-container__message')
      .text()
      .indexOf(loadMessage) > -1,
    'has custom load message'
  );
  assert.ok(
    this.$('.infinite-scroll__pull-to-refresh__message')
      .text()
      .indexOf(refreshMessage) > -1,
    'has custom refresh message'
  );
});

test('rendering items and no items', function(assert) {
  const itemClass = 'test-item-class',
    msg1 = Math.random() + '',
    msg2 = Math.random() + '',
    noItemsMessage = Math.random() + '',
    done = assert.async();
  this.setProperties({ itemClass, noItemsMessage, data: [] });

  this.render(hbs`
    {{#infinite-scroll data=data as |item|}}
      <div class="{{itemClass}}">{{item}}</div>
    {{else}}
      {{noItemsMessage}}
    {{/infinite-scroll}}
  `);
  assert.ok(this.$('.infinite-scroll').length, 'did render');
  let text = this.$().text();
  assert.ok(text.indexOf(msg1) === -1, 'no data items');
  assert.ok(text.indexOf(msg2) === -1, 'no data items');
  assert.ok(text.indexOf(noItemsMessage) > -1, 'displaying "no item" message');
  assert.equal(this.$('.' + itemClass).length, 0);

  this.set('data', [msg1, msg2]);
  wait().then(() => {
    text = this.$().text();
    assert.ok(text.indexOf(msg1) > -1, 'has first data message');
    assert.ok(text.indexOf(msg2) > -1, 'has second data message');
    assert.ok(text.indexOf(noItemsMessage) === -1, 'not displaying "no item" message');
    assert.equal(this.$('.' + itemClass).length, 2);

    done();
  });
});

test("when scrolling up, passed-in data's order is preserved", function(assert) {
  const itemClass = 'test-item-class',
    msg1 = Math.random() + '',
    msg2 = Math.random() + '',
    msg3 = Math.random() + '',
    done = assert.async();
  this.setProperties({
    direction: Constants.INFINITE_SCROLL.DIRECTION.UP,
    itemClass,
    data: [msg1, msg2],
  });

  this.render(hbs`
    {{#infinite-scroll direction=direction data=data as |item|}}
      <div class="{{itemClass}}">{{item}}</div>
    {{/infinite-scroll}}
  `);
  assert.ok(this.$('.infinite-scroll').length, 'did render');

  let $items = this.$('.' + itemClass);
  assert.equal($items.length, 2, 'has two items');
  assert.ok(
    $items
      .eq(0)
      .text()
      .indexOf(msg1) > -1,
    'first item is msg1'
  );
  assert.ok(
    $items
      .eq(1)
      .text()
      .indexOf(msg2) > -1,
    'second item is msg2'
  );

  run(() => this.get('data').pushObject(msg3));
  wait().then(() => {
    $items = this.$('.' + itemClass);
    assert.equal($items.length, 3, 'has three items');
    assert.ok(
      $items
        .eq(0)
        .text()
        .indexOf(msg1) > -1,
      'first item is msg1'
    );
    assert.ok(
      $items
        .eq(1)
        .text()
        .indexOf(msg2) > -1,
      'second item is msg2'
    );
    assert.ok(
      $items
        .eq(2)
        .text()
        .indexOf(msg3) > -1,
      'third item is msg3'
    );

    done();
  });
});

test('registering public API', function(assert) {
  const doRegister = sinon.spy();
  this.setProperties({ doRegister });

  this.render(hbs`{{infinite-scroll doRegister=doRegister}}`);
  assert.ok(this.$('.infinite-scroll').length, 'did render');
  assert.ok(doRegister.calledOnce);
  assert.ok(doRegister.firstCall.args.length, 1);
  assert.equal(typeOf(doRegister.firstCall.args[0].isLoading), 'boolean');
  assert.equal(typeOf(doRegister.firstCall.args[0].isDone), 'boolean');
  assert.equal(typeOf(doRegister.firstCall.args[0].actions.resetAll), 'function');
  assert.equal(typeOf(doRegister.firstCall.args[0].actions.resetPosition), 'function');
  assert.equal(typeOf(doRegister.firstCall.args[0].actions.restorePosition), 'function');
});

test('scroll direction', function(assert) {
  const direction = Constants.INFINITE_SCROLL.DIRECTION.DOWN,
    done = assert.async();
  this.setProperties({ direction });

  this.render(hbs`{{infinite-scroll direction=direction}}`);
  assert.ok(this.$('.infinite-scroll').length, 'did render');
  assert.notOk(this.$('.infinite-scroll--up').length, 'is down not up');
  assert.notOk(this.$('.infinite-scroll__pull-to-refresh--up').length, 'is down not up');

  this.set('direction', Constants.INFINITE_SCROLL.DIRECTION.UP);
  wait().then(() => {
    assert.ok(this.$('.infinite-scroll--up').length, 'is now up');
    assert.ok(this.$('.infinite-scroll__pull-to-refresh--up').length, 'is now up');

    done();
  });
});

test('loading + direction', function(assert) {
  const direction = Constants.INFINITE_SCROLL.DIRECTION.DOWN,
    onLoad = sinon.spy(),
    contentPxHeight = 2888,
    done = assert.async();
  this.setProperties({ direction, onLoad, contentPxHeight, data: [1] });

  this.render(hbs`
    {{#infinite-scroll data=data direction=direction onLoad=onLoad}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
    {{/infinite-scroll}}
  `);
  assert.ok(this.$('.infinite-scroll').length, 'did render');
  assert.ok(this.$('.infinite-scroll__scroll-container').length, 'did render');
  assert.notOk(this.$('.infinite-scroll--up').length, 'is down');
  assert.ok(onLoad.notCalled);

  const $container = this.$('.infinite-scroll__scroll-container');
  $container.scrollTop(contentPxHeight);
  setTimeout(() => {
    assert.ok(onLoad.calledOnce);

    this.set('direction', Constants.INFINITE_SCROLL.DIRECTION.UP);
    wait().then(() => {
      assert.ok(this.$('.infinite-scroll--up').length, 'is up');
      assert.ok(onLoad.calledOnce);

      $container.scrollTop(0);
      setTimeout(() => {
        assert.ok(onLoad.calledTwice);

        done();
      }, 1000);
    });
  }, 1000);
});

test('load handler return value', function(assert) {
  const doRegister = sinon.spy(),
    onLoad = sinon.stub(),
    contentPxHeight = 2888,
    done = assert.async();
  this.setProperties({ doRegister, onLoad, contentPxHeight, data: [1] });

  this.render(hbs`
    {{#infinite-scroll data=data doRegister=doRegister onLoad=onLoad}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
    {{/infinite-scroll}}
  `);
  assert.ok(this.$('.infinite-scroll').length, 'did render');
  assert.notOk(this.$('.infinite-scroll--loading').length, 'not loading');
  assert.ok(doRegister.calledOnce);
  assert.ok(onLoad.notCalled);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isLoading, false);

  let resolveFn;
  const $container = this.$('.infinite-scroll__scroll-container');
  $container.scrollTop(contentPxHeight);
  // `onLoad` handler does not return promise
  setTimeout(() => {
    assert.ok(onLoad.calledOnce);
    assert.equal(
      publicAPI.isLoading,
      false,
      'no loading state when the load handler does not return promise'
    );
    assert.notOk(this.$('.infinite-scroll--loading').length, 'not loading');

    onLoad.callsFake(() => new RSVP.Promise(resolve => (resolveFn = resolve)));
    $container.scrollTop(contentPxHeight / 2); // need to scroll away then back
    $container.scrollTop(contentPxHeight);
    setTimeout(() => {
      assert.equal(onLoad.callCount, 2);
      assert.ok(resolveFn, 'has resolve function to call later');
      assert.equal(
        publicAPI.isLoading,
        true,
        'has loading state when the load handler returns promise'
      );
      assert.ok(this.$('.infinite-scroll--loading').length, 'is loading');

      resolveFn.call();
      wait().then(() => {
        assert.equal(publicAPI.isLoading, false, 'not loading after promise resolves');
        assert.notOk(this.$('.infinite-scroll--loading').length, 'not loading');

        done();
      });
    }, 1000);
  }, 1000);
});

test('avoid infinite loop if loading more does not yield different result', function(assert) {
  const doRegister = sinon.spy(),
    onLoad = sinon.stub(),
    contentPxHeight = 2888,
    done = assert.async();
  this.setProperties({ doRegister, onLoad, contentPxHeight, data: [1], numTotal: null });

  this.render(hbs`
    {{#infinite-scroll data=data numTotal=numTotal doRegister=doRegister onLoad=onLoad}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
    {{/infinite-scroll}}
  `);
  assert.ok(this.$('.infinite-scroll').length, 'did render');
  assert.notOk(this.$('.infinite-scroll--loading').length, 'not loading');
  assert.ok(doRegister.calledOnce);
  assert.ok(onLoad.notCalled);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isLoading, false, 'not loading');
  assert.equal(publicAPI.isDone, false, 'not done');

  const $container = this.$('.infinite-scroll__scroll-container');
  $container.scrollTop(contentPxHeight / 2); // need to scroll away then back
  $container.scrollTop(contentPxHeight);
  setTimeout(() => {
    assert.equal(onLoad.callCount, 1);
    assert.equal(publicAPI.isLoading, false, 'not loading');
    assert.notOk(this.$('.infinite-scroll--loading').length, 'not loading');
    assert.equal(publicAPI.isDone, false, 'not done');

    this.setProperties({ data: [1], numTotal: null });
    $container.scrollTop(contentPxHeight / 2); // need to scroll away then back
    $container.scrollTop(contentPxHeight);
    setTimeout(() => {
      assert.equal(onLoad.callCount, 2);
      assert.equal(publicAPI.isLoading, false, 'not loading');
      assert.notOk(this.$('.infinite-scroll--loading').length, 'not loading');
      assert.equal(publicAPI.isDone, false, 'not done');

      this.setProperties({ data: [1], numTotal: null });
      $container.scrollTop(contentPxHeight / 2); // need to scroll away then back
      $container.scrollTop(contentPxHeight);
      setTimeout(() => {
        assert.equal(onLoad.callCount, 3);
        assert.equal(publicAPI.isLoading, false, 'not loading');
        assert.notOk(this.$('.infinite-scroll--loading').length, 'not loading');

        assert.equal(
          publicAPI.isDone,
          false,
          'need to trigger didReceiveAttrs a third time to check to see if anything has changed'
        );
        this.setProperties({ data: [1], numTotal: null });
        wait()
          .then(() => {
            assert.equal(
              publicAPI.isDone,
              true,
              'is done because too many times try load with no change'
            );

            publicAPI.actions.resetAll();
            return wait();
          })
          .then(() => {
            assert.equal(publicAPI.isLoading, false, 'loading state has been reset');
            assert.equal(publicAPI.isDone, false, 'done state has been reset');

            done();
          });
      }, 1000);
    }, 1000);
  }, 1000);
});

test('marking done with number of items is greater than total number', function(assert) {
  const doRegister = sinon.spy(),
    onLoad = sinon.stub(),
    contentPxHeight = 2888,
    done = assert.async();
  this.setProperties({ doRegister, onLoad, contentPxHeight, data: [1], numTotal: null });

  this.render(hbs`
    {{#infinite-scroll data=data numTotal=numTotal doRegister=doRegister onLoad=onLoad}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
    {{/infinite-scroll}}
  `);
  assert.ok(this.$('.infinite-scroll').length, 'did render');
  assert.notOk(this.$('.infinite-scroll--loading').length, 'not loading');
  assert.ok(doRegister.calledOnce);
  assert.ok(onLoad.notCalled);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isLoading, false, 'not loading');
  assert.equal(publicAPI.isDone, false, 'not done');

  let resolveFn;
  onLoad.callsFake(() => new RSVP.Promise(resolve => (resolveFn = resolve)));
  const $container = this.$('.infinite-scroll__scroll-container');
  $container.scrollTop(contentPxHeight);
  setTimeout(() => {
    assert.ok(onLoad.calledOnce);
    assert.ok(this.$('.infinite-scroll--loading').length, 'is loading');
    assert.equal(publicAPI.isLoading, true, 'is loading');
    assert.equal(publicAPI.isDone, false, 'not done');
    assert.ok(resolveFn, 'has resolve function to call');

    this.setProperties({ data: [1, 2], numTotal: 2 });
    resolveFn.call();
    wait()
      .then(() => {
        assert.notOk(this.$('.infinite-scroll--loading').length, ' not loading');
        assert.equal(publicAPI.isLoading, false, 'not loading');
        assert.equal(publicAPI.isDone, true, 'is done');

        publicAPI.actions.resetAll();
        return wait();
      })
      .then(() => {
        assert.equal(publicAPI.isLoading, false, 'loading state has been reset');
        assert.equal(publicAPI.isDone, false, 'done state has been reset');

        done();
      });
  }, 1000);
});

test('refreshing is disabled when not at the start', function(assert) {
  const contentPxHeight = 2888,
    done = assert.async();
  this.setProperties({ contentPxHeight, data: [1] });

  this.render(hbs`
    {{#infinite-scroll data=data}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
    {{/infinite-scroll}}
  `);
  assert.ok(this.$('.infinite-scroll').length, 'did render');
  assert.notOk(
    this.$('.infinite-scroll__pull-to-refresh--disabled').length,
    'refresh enabled because is at start'
  );

  const $container = this.$('.infinite-scroll__scroll-container');
  $container.scrollTop(contentPxHeight / 2);
  setTimeout(() => {
    assert.ok(
      this.$('.infinite-scroll__pull-to-refresh--disabled').length,
      'refresh disabled because no longer at start'
    );

    done();
  }, 1000);
});

test('scroll container is disabled when refreshing', function(assert) {
  const contentPxHeight = 2888,
    onRefresh = sinon.stub(),
    done = assert.async();
  this.setProperties({ onRefresh, contentPxHeight, data: [1] });

  this.render(hbs`
    {{#infinite-scroll data=data onRefresh=onRefresh}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
    {{/infinite-scroll}}
  `);
  assert.ok(this.$('.infinite-scroll').length, 'did render');
  assert.ok(this.$('.infinite-scroll__pull-to-refresh__content').length, 'did render');
  assert.notOk(this.$('.infinite-scroll__pull-to-refresh--refreshing').length, 'not refreshing');
  assert.notOk(
    this.$('.infinite-scroll__scroll-container--disabled').length,
    'scroll container not disabled because not refreshing'
  );

  let resolveFn;
  onRefresh.callsFake(() => new RSVP.Promise(resolve => (resolveFn = resolve)));
  const $refreshContent = this.$('.infinite-scroll__pull-to-refresh__content');
  $refreshContent.trigger(Ember.$.Event('mousedown', { pageY: 0 }));
  $refreshContent.trigger(Ember.$.Event('mousemove', { pageY: 100 }));
  $refreshContent.trigger(Ember.$.Event('mouseup'));
  wait()
    .then(() => {
      assert.ok(this.$('.infinite-scroll__pull-to-refresh--refreshing').length, 'is refreshing');
      assert.ok(
        this.$('.infinite-scroll__scroll-container--disabled').length,
        'scroll container is disabled because is refreshing'
      );
      assert.ok(resolveFn, 'has resolve function');

      resolveFn.call();
      return wait();
    })
    .then(() => {
      assert.notOk(
        this.$('.infinite-scroll__pull-to-refresh--refreshing').length,
        'not refreshing'
      );
      assert.notOk(
        this.$('.infinite-scroll__scroll-container--disabled').length,
        'scroll container not disabled because not refreshing'
      );

      done();
    });
});

test('resetting/restoring position via public API', function(assert) {
  const doRegister = sinon.spy(),
    contentPxHeight = 2888,
    done = assert.async();
  this.setProperties({
    direction: Constants.INFINITE_SCROLL.DIRECTION.UP,
    doRegister,
    contentPxHeight,
    data: [1],
  });

  this.render(hbs`
    {{#infinite-scroll direction=direction data=data doRegister=doRegister}}
      <div style="height: {{contentPxHeight}}px; width: 100%;"></div>
    {{/infinite-scroll}}
  `);
  assert.ok(this.$('.infinite-scroll').length, 'did render');
  assert.ok(doRegister.calledOnce);
  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isLoading, false, 'not loading');
  assert.equal(publicAPI.isDone, false, 'not done');

  const $container = this.$('.infinite-scroll__scroll-container'),
    $content = this.$('.infinite-scroll__scroll-container__content');
  $container.scrollTop(contentPxHeight / 2);
  setTimeout(() => {
    this.setProperties({ data: [1, 2] });
    wait()
      .then(() => {
        assert.ok(
          $content.height() - contentPxHeight * 2 < 100,
          'content height has approx doubled'
        );
        assert.equal(
          $container.scrollTop(),
          contentPxHeight / 2,
          'but scroll position retains the original, incorrect value'
        );

        return publicAPI.actions.restorePosition();
      })
      .then(() => {
        assert.ok(
          $container.scrollTop() - ($content.outerHeight() - contentPxHeight / 2) < 50,
          'position is approx restored to original offset from the bottom (because scrolling up)'
        );

        return publicAPI.actions.resetPosition();
      })
      .then(() => {
        assert.ok(
          $container.scrollTop() - ($content.outerHeight() - $container.height()) < 50,
          'position is approx reset to very bottom bottom (because scrolling up)'
        );

        done();
      });
  }, 1000);
});
