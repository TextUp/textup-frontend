import $ from 'jquery';
import { run } from '@ember/runloop';
import { typeOf } from '@ember/utils';
import Constants from 'textup-frontend/constants';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

let $testingContainer, originalPadding, originalZoom;

moduleForComponent('pop-over', 'Integration | Component | pop over', {
  integration: true,
  beforeEach() {
    // pad the testing container on the top and left so the component has space on all sides
    // reset zoom because for some reason `ember-testing` has zoom:50% applied on it which
    // messes with our getBoundingClientRect values
    $testingContainer = $('#ember-testing');
    originalPadding = $testingContainer.css('padding');
    originalZoom = $testingContainer.css('padding');

    $testingContainer.css({ padding: '200px', zoom: 'normal' });
  },
  afterEach() {
    $testingContainer.css({ padding: originalPadding, zoom: originalZoom });
  },
});

test('properties', function(assert) {
  this.setProperties({ func: () => null });

  this.render(hbs`{{pop-over}}`);

  assert.ok(this.$('.pop-over').length);

  this.render(hbs`{{pop-over doRegister=func
      onOpen=func
      onClose=func
      onReposition=func
      bodyClickWillClose=false
      position="valid string"}}
  `);

  assert.ok(this.$('.pop-over').length);
});

test('opening', function(assert) {
  const done = assert.async(),
    onOpen = sinon.spy(),
    onReposition = sinon.spy(),
    bodyContent = Math.random();

  this.setProperties({ onOpen, onReposition, bodyContent });
  this.render(hbs`
    {{#pop-over onOpen=onOpen onReposition=onReposition as |popOver|}}
      <button type="button" onclick={{popOver.actions.toggle}}></button>
    {{else}}
      <p>{{bodyContent}}</p>
    {{/pop-over}}
  `);

  assert.ok(this.$('.pop-over').length);
  assert.notOk($('.pop-over__body--open').length);
  assert.ok(this.$('button').length);
  assert.ok(onOpen.notCalled);
  assert.ok(onReposition.notCalled);
  assert.ok(
    $('#ember-testing')
      .text()
      .indexOf(bodyContent) > -1,
    'body content is shown but hidden'
  );

  this.$('button')
    .first()
    .triggerHandler('click');
  wait().then(() => {
    assert.ok($('.pop-over__body--open').length);
    assert.ok(onOpen.calledOnce);
    assert.ok(onReposition.notCalled, 'reposition only called on repositioning after opening');
    assert.ok(
      $('#ember-testing')
        .text()
        .indexOf(bodyContent) > -1
    );
    assert.ok(
      $('.pop-over__body__contents').is(document.activeElement),
      'focus on body contents after opening'
    );

    done();
  });
});

test('registering', function(assert) {
  const done = assert.async(),
    doRegister = sinon.spy(),
    onOpen = sinon.spy(),
    onClose = sinon.spy(),
    onReposition = sinon.spy();

  this.setProperties({ doRegister, onOpen, onClose, onReposition });
  this.render(
    hbs`{{pop-over doRegister=doRegister onOpen=onOpen onReposition=onReposition onClose=onClose}}`
  );

  assert.ok(this.$('.pop-over').length);
  assert.notOk($('.pop-over__body--opening').length);
  assert.ok(doRegister.calledOnce);
  assert.ok(onOpen.notCalled);
  assert.ok(onClose.notCalled);
  assert.ok(onReposition.notCalled);

  const publicAPI = doRegister.firstCall.args[0];
  assert.ok(typeOf(publicAPI) === 'object');
  assert.equal(publicAPI.isOpen, false);
  assert.ok(typeOf(publicAPI.actions.open) === 'function');
  assert.ok(typeOf(publicAPI.actions.close) === 'function');
  assert.ok(typeOf(publicAPI.actions.toggle) === 'function');
  assert.ok(typeOf(publicAPI.actions.reposition) === 'function');

  publicAPI.actions
    .open()
    .then(() => {
      assert.equal(publicAPI.isOpen, true);
      assert.ok(
        $('.pop-over__body--opening').length || $('.pop-over__body--open').length
      );
      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.notCalled);
      assert.ok(onReposition.notCalled);

      return publicAPI.actions.reposition();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, true);
      assert.ok(
        $('.pop-over__body--opening').length || $('.pop-over__body--open').length
      );
      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.notCalled);
      assert.ok(onReposition.calledOnce);

      return publicAPI.actions.close();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, false);
      assert.notOk(
        $('.pop-over__body--opening').length || $('.pop-over__body--open').length
      );
      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.calledOnce);
      assert.ok(onReposition.calledOnce);

      return publicAPI.actions.toggle();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, true);
      assert.ok(
        $('.pop-over__body--opening').length || $('.pop-over__body--open').length
      );
      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledTwice);
      assert.ok(onClose.calledOnce);
      assert.ok(onReposition.calledOnce);

      return publicAPI.actions.toggle();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, false);
      assert.notOk(
        $('.pop-over__body--opening').length || $('.pop-over__body--open').length
      );
      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledTwice);
      assert.ok(onClose.calledTwice);
      assert.ok(onReposition.calledOnce);

      done();
    });
});

test('appropriate floating coordinations based on specified position', function(assert) {
  const done = assert.async(),
    doRegister = sinon.spy(),
    onReposition = sinon.spy();
  this.setProperties({ position: null, doRegister, onReposition });

  this.render(hbs`
    {{#pop-over doRegister=doRegister onReposition=onReposition position=position}}
      <div style="width: 100px; height: 100px;">Trigger</div>
    {{else}}
      <div style="width: 100px; height: 100px;">Body</div>
    {{/pop-over}}
  `);

  assert.ok(this.$('.pop-over').length);
  assert.ok($('.pop-over__body__floating-container').length);
  assert.ok(this.$('.pop-over').length);
  assert.ok(doRegister.calledOnce);
  assert.ok(onReposition.notCalled);

  let elementCoords = this.$('.pop-over')[0].getBoundingClientRect();
  const { top: spaceOnTop, left: spaceOnLeft, width, height } = elementCoords,
    viewportHeight = $(window).height(),
    viewportWidth = $(window).width(),
    spaceOnRight = viewportWidth - spaceOnLeft - width,
    spaceOnBottom = viewportHeight - spaceOnTop - height,
    $floatingContainer = $('.pop-over__body__floating-container');

  // invalid position specified -- pick side with the most space
  const publicAPI = doRegister.firstCall.args[0];
  publicAPI.actions
    .open()
    .then(() => {
      assert.ok(doRegister.calledOnce);
      assert.equal(
        onReposition.callCount,
        0,
        'positioning happens on open but reposition hook not called'
      );

      const floatingTop = $floatingContainer.css('top');
      if (spaceOnTop > spaceOnBottom) {
        assert.ok($('.pop-over__body--position-top').length, 'position on top');
        assert.ok(parseFloat(floatingTop) < elementCoords.top);
      } else {
        assert.ok($('.pop-over__body--position-bottom').length, 'position on bottom');
        assert.ok(parseFloat(floatingTop) > elementCoords.top);
      }
      const floatingLeft = $floatingContainer.css('left');
      if (spaceOnLeft > spaceOnRight) {
        assert.ok($('.pop-over__body--align-right').length, 'align to right edge');
        assert.ok(parseFloat(floatingLeft) > elementCoords.left);
      } else {
        assert.ok($('.pop-over__body--align-left').length, 'align to left edge');
        assert.ok(parseFloat(floatingLeft) < elementCoords.right);
      }

      elementCoords = this.$('.pop-over')[0].getBoundingClientRect();
      this.set('position', Constants.POP_OVER.POSITION.TOP);
      return wait();
    })
    .then(() => {
      assert.ok(doRegister.calledOnce);
      assert.equal(onReposition.callCount, 1);

      const floatingTop = $floatingContainer.css('top');

      assert.ok($('.pop-over__body--position-top').length);
      assert.notOk($('.pop-over__body--position-bottom').length);
      assert.ok(parseFloat(floatingTop) < elementCoords.top);

      elementCoords = this.$('.pop-over')[0].getBoundingClientRect();
      this.set('position', Constants.POP_OVER.POSITION.BOTTOM);
      return wait();
    })
    .then(() => {
      assert.ok(doRegister.calledOnce);
      assert.equal(onReposition.callCount, 2);

      const floatingTop = $floatingContainer.css('top');

      assert.notOk($('.pop-over__body--position-top').length);
      assert.ok($('.pop-over__body--position-bottom').length);
      assert.ok(parseFloat(floatingTop) > elementCoords.top);

      done();
    });
});

test('truncate body if overflow', function(assert) {
  const done = assert.async(),
    doRegister = sinon.spy(),
    onReposition = sinon.spy();
  this.setProperties({ position: Constants.POP_OVER.POSITION.TOP, doRegister, onReposition });

  this.render(hbs`
    {{#pop-over doRegister=doRegister onReposition=onReposition position=position}}
      <div style="width: 100px; height: 100px;">Trigger</div>
    {{else}}
      <div style="width: 8888px; height: 8888px;">Body</div>
    {{/pop-over}}
  `);

  assert.ok(this.$('.pop-over').length);
  assert.ok($('.pop-over__body__floating-container').length);
  assert.ok($('.pop-over__body__dimension-container').length);
  assert.ok(doRegister.calledOnce);
  assert.ok(onReposition.notCalled);

  const publicAPI = doRegister.firstCall.args[0];
  publicAPI.actions.open().then(() => {
    assert.equal(publicAPI.isOpen, true);
    assert.ok(
      $('.pop-over__body--opening').length || $('.pop-over__body--open').length
    );
    assert.ok(doRegister.calledOnce);
    assert.ok(onReposition.notCalled);

    const $dimensionContainer = $('.pop-over__body__dimension-container'),
      styleAttr = $dimensionContainer.attr('style');
    assert.ok(styleAttr.indexOf('max-height') > -1, 'has vertical overflow');
    assert.ok(styleAttr.indexOf('max-width') > -1, 'has horizontal overflow');

    done();
  });
});

test('appropriate positioning on repeating openings', function(assert) {
  const done = assert.async(),
    doRegister = sinon.spy();

  this.setProperties({ position: Constants.POP_OVER.POSITION.BOTTOM, doRegister });
  this.render(hbs`
    {{#pop-over doRegister=doRegister position=position}}
      <div style="width: 100px; height: 100px;">Trigger</div>
    {{else}}
      <div style="width: 100px; height: 100px; background: red;">Body</div>
    {{/pop-over}}
  `);

  assert.ok(this.$('.pop-over').length);
  assert.ok($('.pop-over__body__floating-container').length);
  assert.ok(doRegister.calledOnce);

  const triggerElement = this.$('.pop-over')[0],
    $floatingContainer = $('.pop-over__body__floating-container'),
    publicAPI = doRegister.firstCall.args[0];
  let bottom = triggerElement.getBoundingClientRect().bottom;
  publicAPI.actions
    .open()
    .then(() => {
      assert.equal(publicAPI.isOpen, true);
      assert.ok(
        $('.pop-over__body--opening').length || $('.pop-over__body--open').length
      );
      assert.ok(doRegister.calledOnce);

      const floatingTop = $floatingContainer.css('top');
      assert.ok(parseFloat(floatingTop) >= bottom - 1, 'minus one to account for rounding error');

      return publicAPI.actions.close();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, false);
      assert.notOk(
        $('.pop-over__body--opening').length || $('.pop-over__body--open').length
      );
      assert.ok(doRegister.calledOnce);

      bottom = triggerElement.getBoundingClientRect().bottom;
      return publicAPI.actions.open();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, true);
      assert.ok(
        $('.pop-over__body--opening').length || $('.pop-over__body--open').length
      );
      assert.ok(doRegister.calledOnce);

      const floatingTop = $floatingContainer.css('top');
      assert.ok(parseFloat(floatingTop) >= bottom - 1, 'minus one to account for rounding error');

      done();
    });
});

test('reposition on resize, orientation change, and mutation of child nodes', function(assert) {
  const done = assert.async(),
    doRegister = sinon.spy(),
    onReposition = sinon.spy();

  this.setProperties({ doRegister, onReposition });
  this.render(hbs`
    {{#pop-over doRegister=doRegister onReposition=onReposition}}
      <div style="width: 100px; height: 100px;">Trigger</div>
    {{else}}
      <div style="width: 100px; height: 100px;">Body</div>
    {{/pop-over}}
  `);

  assert.ok(this.$('.pop-over').length);
  assert.ok(doRegister.calledOnce);
  assert.ok(onReposition.notCalled);

  const publicAPI = doRegister.firstCall.args[0];
  publicAPI.actions
    .open()
    .then(() => {
      assert.equal(publicAPI.isOpen, true);
      assert.ok(
        $('.pop-over__body--opening').length || $('.pop-over__body--open').length,
        'wrapping up opening so not completely done yet'
      );
      assert.equal(onReposition.callCount, 0);

      $(window).trigger('resize');
      return wait();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, true);
      assert.ok($('.pop-over__body--open').length);
      assert.equal(onReposition.callCount, 1);

      $(window).trigger('orientationchange');
      return wait();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, true);
      assert.ok($('.pop-over__body--open').length);
      assert.equal(onReposition.callCount, 2);

      assert.ok($('.pop-over__body__contents').length);
      $('.pop-over__body__contents').append('<p>Hi</p>');
      return wait();
    })
    .then(() => {
      assert.equal(publicAPI.isOpen, true);
      assert.ok($('.pop-over__body--open').length);
      assert.equal(onReposition.callCount, 3);

      done();
    });
});

test('closing on via handler in trigger', function(assert) {
  const done = assert.async(),
    doRegister = sinon.spy(),
    onOpen = sinon.spy(),
    onClose = sinon.spy(),
    onReposition = sinon.spy();

  this.setProperties({ doRegister, onOpen, onClose, onReposition });
  this.render(hbs`
    {{#pop-over doRegister=doRegister onOpen=onOpen onReposition=onReposition onClose=onClose as |popOver|}}
      <div style="width: 100px; height: 100px;">
        <button type="button" onclick={{popOver.actions.toggle}}>Trigger</button>
      </div>
    {{else}}
      <div style="width: 100px; height: 100px;">Body</div>
    {{/pop-over}}
  `);

  assert.ok(this.$('.pop-over').length);
  assert.notOk($('.pop-over__body--open').length);
  assert.ok(doRegister.calledOnce);
  assert.ok(onOpen.notCalled);
  assert.ok(onClose.notCalled);
  assert.ok(onReposition.notCalled);

  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isOpen, false);

  this.$('.pop-over button')
    .first()
    .triggerHandler('click');
  wait()
    .then(() => {
      assert.ok($('.pop-over__body--open').length);
      assert.equal(publicAPI.isOpen, true);

      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.notCalled);
      assert.ok(onReposition.notCalled);

      this.$('.pop-over button')
        .first()
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.notOk($('.pop-over__body--open').length);
      assert.equal(publicAPI.isOpen, false);

      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.calledOnce);
      assert.ok(onReposition.notCalled);

      done();
    });
});

test('closing via user interaction', function(assert) {
  const done = assert.async(),
    doRegister = sinon.spy(),
    onOpen = sinon.spy(),
    onClose = sinon.spy(),
    onReposition = sinon.spy();

  this.setProperties({ doRegister, onOpen, onClose, onReposition });
  this.render(hbs`
    {{#pop-over bodyClickWillClose=false
      doRegister=doRegister
      onOpen=onOpen
      onReposition=onReposition
      onClose=onClose as |popOver|}}
      <div style="width: 100px; height: 100px;">
        <button type="button" onclick={{popOver.actions.toggle}}>Trigger</button>
      </div>
    {{else}}
      <div style="width: 100px; height: 100px;">Body</div>
    {{/pop-over}}
  `);

  assert.ok(this.$('.pop-over').length);
  assert.notOk($('.pop-over__body--open').length);
  assert.ok(doRegister.calledOnce);
  assert.ok(onOpen.notCalled);
  assert.ok(onClose.notCalled);
  assert.ok(onReposition.notCalled);

  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isOpen, false);

  this.$('.pop-over button')
    .first()
    .triggerHandler('click');
  wait()
    .then(() => {
      assert.ok($('.pop-over__body--open').length);
      assert.equal(publicAPI.isOpen, true);

      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.notCalled);
      assert.ok(onReposition.notCalled);

      assert.ok($('.pop-over__body__contents').length);
      $('.pop-over__body__contents')
        .children()
        .first()
        .trigger('click');
      return wait();
    })
    .then(() => {
      assert.ok($('.pop-over__body--open').length);
      assert.equal(publicAPI.isOpen, true, 'click inside pop over body does not close');

      assert.ok($('.pop-over__body__overlay').length);
      $('.pop-over__body__overlay')
        .first()
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.notOk($('.pop-over__body--open').length);
      assert.equal(publicAPI.isOpen, false);

      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.calledOnce);
      assert.ok(onReposition.notCalled);

      this.$('.pop-over button')
        .first()
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok($('.pop-over__body--open').length);
      assert.equal(publicAPI.isOpen, true);

      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledTwice);
      assert.ok(onClose.calledOnce);
      assert.ok(onReposition.notCalled);

      // only continue with testing the touch handler if the browser supports these touch events
      // see https://stackoverflow.com/a/2915912
      if ('ontouchend' in document.documentElement) {
        $('.pop-over__body__overlay')
          .first()
          .triggerHandler('touchend');
        wait().then(() => {
          assert.notOk($('.pop-over__body--open').length);
          assert.equal(publicAPI.isOpen, false);

          assert.ok(doRegister.calledOnce);
          assert.ok(onOpen.calledTwice);
          assert.ok(onClose.calledTwice);
          assert.ok(onReposition.notCalled);

          done();
        });
      } else {
        done();
      }
    });
});

test('close when clicking on body', function(assert) {
  const done = assert.async(),
    doRegister = sinon.spy(),
    onOpen = sinon.spy(),
    onClose = sinon.spy(),
    onReposition = sinon.spy();

  this.setProperties({ doRegister, onOpen, onClose, onReposition });
  this.render(hbs`
    {{#pop-over doRegister=doRegister
      onOpen=onOpen
      onReposition=onReposition
      onClose=onClose as |popOver|}}
      <div style="width: 100px; height: 100px;">
        <button type="button" onclick={{popOver.actions.toggle}}>Trigger</button>
      </div>
    {{else}}
      <div style="width: 100px; height: 100px;">Body</div>
    {{/pop-over}}
  `);

  assert.ok(this.$('.pop-over').length);
  assert.notOk($('.pop-over__body--open').length);
  assert.ok(doRegister.calledOnce);
  assert.ok(onOpen.notCalled);
  assert.ok(onClose.notCalled);
  assert.ok(onReposition.notCalled);

  const publicAPI = doRegister.firstCall.args[0];
  assert.equal(publicAPI.isOpen, false);

  this.$('.pop-over button')
    .first()
    .triggerHandler('click');
  wait().then(() => {
    assert.ok($('.pop-over__body--open').length);
    assert.equal(publicAPI.isOpen, true);

    assert.ok(doRegister.calledOnce);
    assert.ok(onOpen.calledOnce);
    assert.ok(onClose.notCalled);
    assert.ok(onReposition.notCalled);

    assert.ok($('.pop-over__body__contents').length);
    $('.pop-over__body__contents')
      .first()
      .triggerHandler('click');
    run.later(() => {
      assert.notOk($('.pop-over__body--open').length, 'click on body DOES close by default');
      assert.equal(publicAPI.isOpen, false);

      assert.ok(doRegister.calledOnce);
      assert.ok(onOpen.calledOnce);
      assert.ok(onClose.calledOnce);
      assert.ok(onReposition.notCalled);

      done();
    }, 1000);
  });
});
