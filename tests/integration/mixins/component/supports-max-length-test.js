import Constants from 'textup-frontend/constants';
import ElementUtils from 'textup-frontend/utils/element';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import SupportsMaxLength from 'textup-frontend/mixins/component/supports-max-length';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('', 'Integration | Mixin | component/supports max length', {
  integration: true,
  beforeEach() {
    this.register(
      'component:invalid-supports-max-length',
      Ember.Component.extend(SupportsMaxLength)
    );
    this.register(
      'component:valid-supports-max-length',
      Ember.Component.extend(SupportsMaxLength, {
        tagName: 'textarea',
        _buildCurrentValueLength() {
          return this.$().val().length;
        },
      })
    );
  },
});

test('properties', function(assert) {
  this.setProperties({ func: () => null });

  this.render(hbs`{{valid-supports-max-length}}`);

  assert.ok(Ember.$('.ember-view').length, 'did render');

  this.render(hbs`{{valid-supports-max-length maxLength=88
      maxLengthPosition="string"
      showMaxLengthPercentThreshold=88
      maxLengthIndicatorClass="string"
      maxLengthContainerClass="string"}}`);

  assert.ok(Ember.$('.ember-view').length, 'did render');

  assert.throws(() => {
    this.render(hbs`{{valid-supports-max-length maxLength="hi"
      maxLengthPosition=88
      showMaxLengthPercentThreshold="hi"
      maxLengthIndicatorClass=(hash not="valid")
      maxLengthContainerClass=88}}`);
  });
});

test('components implementing the mandatory handler', function(assert) {
  // mandatory hook not implemented
  assert.throws(() => this.render(hbs`{{invalid-supports-max-length}}`));
});

test('rendering', function(assert) {
  this.setProperties({ originalClass: 'original-component-class' });

  this.render(hbs`{{valid-supports-max-length}}`);

  assert.ok(Ember.$('.ember-view').length, 'did render');
  assert.notOk(Ember.$('.max-length').length, 'max length not activated by default');

  this.render(hbs`{{valid-supports-max-length maxLength=88 classNames=originalClass}}`);

  assert.ok(Ember.$('.ember-view').length, 'did render');
  assert.ok(Ember.$('.max-length').length, 'when `maxLength` is specified, will render');
  assert.ok(
    Ember.$(`.max-length .${this.get('originalClass')}`).length,
    'original component is a child of the new max-length container element'
  );
  assert.ok(Ember.$(`.max-length__indicator`).length, 'max-length has indicator');
});

test('rendering with custom classes', function(assert) {
  const componentClass = 'component-class',
    containerClass = 'container-class',
    indicatorClass = 'indicator-class';
  this.setProperties({ componentClass, containerClass, indicatorClass });

  this.render(hbs`{{valid-supports-max-length maxLength=88 classNames=componentClass
    maxLengthContainerClass=containerClass
    maxLengthIndicatorClass=indicatorClass}}`);

  assert.ok(Ember.$('.ember-view').length, 'did render');
  assert.ok(Ember.$(`.${containerClass}`).length, 'has max length container');
  assert.ok(
    Ember.$(`.${containerClass} .${componentClass}.ember-view`).length,
    'container contains original component'
  );
  assert.ok(
    Ember.$(`.${containerClass} .${indicatorClass}`).length,
    'container contains indicator'
  );
});

test('rebuilding or reverting changes after initial render', function(assert) {
  const done = assert.async();

  this.setProperties({ maxLength: null });

  this.render(hbs`{{valid-supports-max-length maxLength=maxLength}}`);

  assert.ok(Ember.$('.ember-view').length);
  assert.notOk(Ember.$('.max-length').length);
  assert.notOk(Ember.$('.max-length .ember-view').length);

  this.setProperties({ maxLength: 88 });

  wait()
    .then(() => {
      assert.ok(Ember.$('.max-length').length);
      assert.ok(Ember.$('.max-length .ember-view').length);
      assert.ok(Ember.$('.max-length .ember-view').attr('maxlength'));

      this.setProperties({ maxLength: -1 });
      return wait();
    })
    .then(() => {
      assert.ok(
        Ember.$('.ember-view').length,
        'specifying a non-positive maxLength is equivalent to not specifying maxLength'
      );
      assert.notOk(Ember.$('.max-length').length);
      assert.notOk(Ember.$('.max-length .ember-view').length);
      assert.notOk(Ember.$('.max-length .ember-view').attr('maxlength'));

      done();
    });
});

test('specifying position of indicator', function(assert) {
  const done = assert.async();

  this.setProperties({ maxLengthPosition: null });

  this.render(hbs`{{valid-supports-max-length maxLength=88 maxLengthPosition=maxLengthPosition}}`);

  assert.ok(Ember.$('.max-length').length);
  assert.ok(Ember.$('.max-length .ember-view').length);
  assert.ok(
    Ember.$('.max-length .max-length__indicator--position-top').length,
    'when unspecified, position defaults to top'
  );
  assert.notOk(
    Ember.$('.max-length .max-length__indicator--position-bottom').length,
    'other position classes not added'
  );
  assert.notOk(
    Ember.$('.max-length .max-length__indicator--position-left').length,
    'other position classes not added'
  );
  assert.notOk(
    Ember.$('.max-length .max-length__indicator--position-right').length,
    'other position classes not added'
  );

  this.setProperties({ maxLengthPosition: Constants.MAX_LENGTH.POSITION.BOTTOM });

  wait().then(() => {
    assert.ok(Ember.$('.max-length .max-length__indicator--position-bottom').length);
    assert.notOk(
      Ember.$('.max-length .max-length__indicator--position-top').length,
      'other position classes not added'
    );
    assert.notOk(
      Ember.$('.max-length .max-length__indicator--position-left').length,
      'other position classes not added'
    );
    assert.notOk(
      Ember.$('.max-length .max-length__indicator--position-right').length,
      'other position classes not added'
    );

    done();
  });
});

test('hiding and showing the indicator', function(assert) {
  const done = assert.async();

  this.render(hbs`{{valid-supports-max-length maxLength=88 showMaxLengthPercentThreshold=0}}`);

  assert.ok(Ember.$('.max-length').length);
  assert.ok(Ember.$('.max-length .ember-view').length);
  assert.notOk(Ember.$('.max-length__indicator--visible').length);

  Ember.$('.max-length .ember-view')
    .first()
    .triggerHandler('focusin');
  wait()
    .then(() => {
      assert.ok(Ember.$('.max-length__indicator--visible').length);

      Ember.$('.max-length .ember-view')
        .first()
        .triggerHandler('focusout');
      return wait();
    })
    .then(() => {
      assert.notOk(Ember.$('.max-length__indicator--visible').length);

      done();
    });
});

test('triggering remaining to be recalculated', function(assert) {
  const done = assert.async();
  let initialIndicatorText;

  this.render(hbs`{{valid-supports-max-length maxLength=88 showMaxLengthPercentThreshold=0}}`);

  assert.ok(Ember.$('.max-length').length);
  assert.ok(Ember.$('.max-length .ember-view').length);
  assert.notOk(Ember.$('.max-length__indicator--visible').length);

  Ember.$('.max-length .ember-view')
    .first()
    .triggerHandler('focusin');
  wait()
    .then(() => {
      assert.ok(Ember.$('.max-length .ember-view').length);
      assert.ok(Ember.$('.max-length__indicator--visible').length);
      initialIndicatorText = Ember.$('.max-length__indicator--visible').text();

      Ember.$('.ember-view').val('new updated value');
      Ember.$('.max-length .ember-view')
        .first()
        .triggerHandler('keyup');
      return wait();
    })
    .then(() => {
      assert.ok(Ember.$('.max-length__indicator--visible').length);
      assert.notEqual(Ember.$('.max-length__indicator--visible').text(), initialIndicatorText);

      done();
    });
});

test('displaying indicator only within specified threshold', function(assert) {
  const done = assert.async(),
    maxLength = 100,
    remainingPercentThreshold = 50;
  this.setProperties({ maxLength, remainingPercentThreshold });

  this.render(
    hbs`{{valid-supports-max-length maxLength=maxLength showMaxLengthPercentThreshold=remainingPercentThreshold}}`
  );

  assert.ok(Ember.$('.max-length').length);
  assert.ok(Ember.$('.max-length .ember-view').length);
  assert.notOk(Ember.$('.max-length__indicator--visible').length);

  Ember.$('.max-length .ember-view')
    .first()
    .triggerHandler('focusin');
  wait()
    .then(() => {
      assert.notOk(
        Ember.$('.max-length__indicator--visible').length,
        'still do not show indicator because the current value is not long enough to exceed threshold'
      );

      // update contents
      Ember.$('.ember-view').val(
        Array(maxLength - 1)
          .fill()
          .map(() => '8')
          .join('')
      );
      Ember.$('.max-length .ember-view')
        .first()
        .triggerHandler('keyup');
      return wait();
    })
    .then(() => {
      assert.ok(
        Ember.$('.max-length__indicator--visible').length,
        'once the value length exceeds the threshold, then the indicator should be shown WITHOUT REFOCUSING IN'
      );

      done();
    });
});

test('indicator is shown when already focused before building', function(assert) {
  const isOrContainsElementStub = sinon.stub(ElementUtils, 'isOrContainsElement');

  isOrContainsElementStub.returns(false);
  this.render(hbs`{{valid-supports-max-length maxLength=88 showMaxLengthPercentThreshold=0}}`);

  assert.ok(Ember.$('.max-length').length);
  assert.ok(Ember.$('.max-length .ember-view').length);
  assert.notOk(
    Ember.$('.max-length__indicator--visible').length,
    'on initial render do not show indicator'
  );

  isOrContainsElementStub.returns(true);
  this.render(hbs`{{valid-supports-max-length maxLength=88 showMaxLengthPercentThreshold=0}}`);

  assert.ok(Ember.$('.max-length').length);
  assert.ok(Ember.$('.max-length .ember-view').length);
  assert.ok(
    Ember.$('.max-length__indicator--visible').length,
    'do show indicator on initial render if component is somehow already focused'
  );

  isOrContainsElementStub.restore();
});
