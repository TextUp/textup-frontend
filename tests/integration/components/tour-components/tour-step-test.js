import $ from 'jquery';
import hbs from 'htmlbars-inline-precompile';
import PlatformUtils from 'textup-frontend/utils/platform';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'tour-components/tour-step',
  'Integration | Component | tour components/tour step',
  {
    integration: true,
  }
);

test('pressing buttons work and renders correctly - first step', function(assert) {
  const back = sinon.spy(),
    done = assert.async(),
    next = sinon.spy();
  const title = 'Welcome to TextUp',
    text = 'This is the welcome text';
  this.setProperties({
    title,
    text,
    isFirstStep: true,
    isLastStep: false,
    onNext: next,
    onBack: back,
    onFinish: () => null,
  });
  this.render(hbs`
    {{tour-components/tour-step title=title
      text=text
      isFirstStep=isFirstStep
      isLastStep=isLastStep
      onNext=onNext
      onBack=onBack
      onFinish=onFinish}}
  `);
  assert.strictEqual(
    $('.tour-step__header__text')
      .text()
      .includes(title),
    true,
    'title is in the div'
  );
  assert.strictEqual(
    $('.tour-step__content')
      .text()
      .includes(text),
    true,
    'text is in the div'
  );
  assert.strictEqual(
    $('.tour-step__button--next')
      .text()
      .includes('Next'),
    true,
    'div contains next button'
  );
  $('.tour-step__button.tour-step__button--back')
    .first()
    .triggerHandler('click');
  wait()
    .then(() => {
      assert.ok(back.notCalled, 'back is called');
      $('.tour-step__button.tour-step__button--next')
        .first()
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok(next.calledOnce, 'finish is called');
      done();
    });
});

test('pressing buttons work and renders correctly - middle step', function(assert) {
  const back = sinon.spy(),
    done = assert.async(),
    next = sinon.spy();

  const title = 'Welcome to TextUp',
    text = 'This is the welcome text';
  this.setProperties({
    title,
    text,
    isFirstStep: false,
    isLastStep: false,
    onNext: next,
    onBack: back,
    onFinish: () => null,
  });
  this.render(hbs`
    {{tour-components/tour-step title=title
      text=text
      isFirstStep=isFirstStep
      isLastStep=isLastStep
      onNext=onNext
      onBack=onBack
      onFinish=onFinish}}
  `);
  assert.strictEqual(
    $('.tour-step__header__text')
      .text()
      .includes(title),
    true,
    'title is in the div'
  );
  assert.strictEqual(
    $('.tour-step__content')
      .text()
      .includes(text),
    true,
    'text is in the div'
  );
  assert.strictEqual(
    $('.tour-step__button--next')
      .text()
      .includes('Next'),
    true,
    'div contains next button'
  );
  $('.tour-step__button.tour-step__button--back')
    .first()
    .triggerHandler('click');
  wait()
    .then(() => {
      assert.ok(back.calledOnce, 'back is called');
      $('.tour-step__button.tour-step__button--next')
        .first()
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok(next.calledOnce, 'finish is called');

      done();
    });
});

test('pressing buttons work and renders correctly - last step', function(assert) {
  const back = sinon.spy(),
    finish = sinon.spy(),
    done = assert.async();

  const title = 'Welcome to TextUp',
    text = 'This is the welcome text';
  this.setProperties({
    title,
    text,
    isFirstStep: false,
    isLastStep: true,
    onNext: () => null,
    onBack: back,
    onFinish: finish,
  });
  this.render(hbs`
    {{tour-components/tour-step title=title
      text=text
      isFirstStep=isFirstStep
      isLastStep=isLastStep
      onNext=onNext
      onBack=onBack
      onFinish=onFinish}}
  `);
  assert.strictEqual(
    $('.tour-step__header__text')
      .text()
      .includes(title),
    true,
    'title is in the div'
  );
  assert.strictEqual(
    $('.tour-step__content')
      .text()
      .includes(text),
    true,
    'text is in the div'
  );
  assert.strictEqual(
    $('.tour-step__button--next')
      .text()
      .includes('Finish'),
    true,
    'div contains finish button'
  );
  $('.tour-step__button.tour-step__button--back')
    .first()
    .triggerHandler('click');
  wait()
    .then(() => {
      assert.ok(back.calledOnce, 'back is called');
      $('.tour-step__button.tour-step__button--next')
        .first()
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok(finish.calledOnce, 'finish is called');

      done();
    });
});

test('on mobile, click then scroll-to element to highlight then calculating overlay', function(assert) {
  const onClick = sinon.spy(),
    done = assert.async(),
    clickElementId = 'element-to-click',
    highlightElementId = 'element-to-highlight',
    isMobile = sinon.stub(PlatformUtils, 'isMobile').returns(true);
  this.setProperties({
    onClick,
    clickElementId,
    highlightElementId,
    elementToOpenMobile: null,
    elementToHighlightMobile: null,
    fn: sinon.spy(),
  });
  this.render(hbs`
    <button type="buton" onclick={{onClick}} id={{clickElementId}}></button>
    <div id={{highlightElementId}}></div>
    {{tour-components/tour-step title="hi"
      text="hi"
      isFirstStep=false
      isLastStep=false
      onNext=fn
      onBack=fn
      onFinish=fn
      elementToOpenMobile=elementToOpenMobile
      elementToHighlightMobile=elementToHighlightMobile}}
  `);

  assert.ok(this.$('.tour-step').length, 'did render');

  setTimeout(() => {
    assert.ok(onClick.notCalled);
    assert.equal($('.overlay--svg.display-s mask rect').length, 1, 'no overlay cutout');

    this.set('elementToHighlightMobile', '#' + highlightElementId);
    setTimeout(() => {
      assert.ok(onClick.notCalled);
      assert.equal($('.overlay--svg.display-s mask rect').length, 2, 'has overlay cutout');

      this.set('elementToOpenMobile', '#' + clickElementId);
      setTimeout(() => {
        assert.ok(onClick.calledOnce, 'click is called');
        assert.equal($('.overlay--svg.display-s mask rect').length, 2, 'has overlay cutout');

        isMobile.restore();
        done();
      }, 2000); // long wait because of manual delay on these actions
    }, 2000);
  }, 2000);
});
