import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'tour-components/tour-step',
  'Integration | Component | tour components/tour step',
  {
    integration: true
  }
);

test('pressing buttons work and renders correctly - first step', function(assert) {
  const back = sinon.spy(),
    done = assert.async(),
    next = sinon.spy();
  const title = 'Welcome to TextUp',
    text = 'This is the welcome text';
  this.setProperties({
    title: title,
    text: text,
    isFirstStep: true,
    isLastStep: false,
    onNext: next,
    onBack: back,
    onFinish: () => null
  });
  this.render(hbs`
    {{tour-components/tour-step title=title text=text isFirstStep=isFirstStep
    isLastStep=isLastStep onNext=onNext onBack=onBack onFinish=onFinish}}
  `);
  assert.strictEqual(
    Ember.$('.tour-step__header__text')
      .text()
      .includes(title),
    true,
    'title is in the div'
  );
  assert.strictEqual(
    Ember.$('.tour-step__content')
      .text()
      .includes(text),
    true,
    'text is in the div'
  );
  assert.strictEqual(
    Ember.$('.tour-step__button--next')
      .text()
      .includes('Next'),
    true,
    'div contains next button'
  );
  Ember.$('.tour-step__button.tour-step__button--back')
    .first()
    .click();
  wait()
    .then(() => {
      assert.ok(back.notCalled, 'back is called');
      Ember.$('.tour-step__button.tour-step__button--next')
        .first()
        .click();
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
    title: title,
    text: text,
    isFirstStep: false,
    isLastStep: false,
    onNext: next,
    onBack: back,
    onFinish: () => null
  });
  this.render(hbs`
    {{tour-components/tour-step title=title text=text isFirstStep=isFirstStep
    isLastStep=isLastStep onNext=onNext onBack=onBack onFinish=onFinish}}
  `);
  assert.strictEqual(
    Ember.$('.tour-step__header__text')
      .text()
      .includes(title),
    true,
    'title is in the div'
  );
  assert.strictEqual(
    Ember.$('.tour-step__content')
      .text()
      .includes(text),
    true,
    'text is in the div'
  );
  assert.strictEqual(
    Ember.$('.tour-step__button--next')
      .text()
      .includes('Next'),
    true,
    'div contains next button'
  );
  Ember.$('.tour-step__button.tour-step__button--back')
    .first()
    .click();
  wait()
    .then(() => {
      assert.ok(back.calledOnce, 'back is called');
      Ember.$('.tour-step__button.tour-step__button--next')
        .first()
        .click();
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
    title: title,
    text: text,
    isFirstStep: false,
    isLastStep: true,
    onNext: () => null,
    onBack: back,
    onFinish: finish
  });
  this.render(hbs`
    {{tour-components/tour-step title=title text=text isFirstStep=isFirstStep
    isLastStep=isLastStep onNext=onNext onBack=onBack onFinish=onFinish}}
  `);
  assert.strictEqual(
    Ember.$('.tour-step__header__text')
      .text()
      .includes(title),
    true,
    'title is in the div'
  );
  assert.strictEqual(
    Ember.$('.tour-step__content')
      .text()
      .includes(text),
    true,
    'text is in the div'
  );
  assert.strictEqual(
    Ember.$('.tour-step__button--next')
      .text()
      .includes('Finish'),
    true,
    'div contains finish button'
  );
  Ember.$('.tour-step__button.tour-step__button--back')
    .first()
    .click();
  wait()
    .then(() => {
      assert.ok(back.calledOnce, 'back is called');
      Ember.$('.tour-step__button.tour-step__button--next')
        .first()
        .click();
      return wait();
    })
    .then(() => {
      assert.ok(finish.calledOnce, 'finish is called');
      done();
    });
});
