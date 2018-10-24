import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { formatSecondsAsTimeElapsed } from 'textup-frontend/utils/time';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('audio-control/display', 'Integration | Component | audio control/display', {
  integration: true
});

test('inputs', function(assert) {
  this.render(hbs`{{audio-control/display}}`);

  assert.ok(this.$('.audio-control__display').length, 'did render');

  this.setProperties({ number: 123, string: '123', func: () => {} });

  this.render(hbs`
    {{audio-control/display message=string
      currentNumSeconds=number
      maxNumSeconds=number
      onSelect=func}}
  `);

  assert.ok(this.$('.audio-control__display').length, 'did render');

  assert.throws(
    () =>
      this.render(hbs`
        {{audio-control/display message=number
          maxNumSeconds=string
          currentNumSeconds=string
          onSelect=string}}
      `),
    'incorrect types'
  );
});

test('displaying long message', function(assert) {
  const longMsg = Array(200)
    .fill()
    .map(() => 'a')
    .join('');
  this.setProperties({ longMsg });

  this.render(hbs`{{audio-control/display message=longMsg}}`);

  assert.ok(this.$('.audio-control__display').length, 'did render');
  assert.ok(this.$('.audio-control__display__message').length, 'did render text');

  const text = this.$().text();
  assert.ok(text.includes(longMsg));

  const $message = this.$('.audio-control__display__message');
  assert.ok($message[0].scrollWidth > $message.innerWidth(), 'text has been truncated');
});

test('displaying time elapsed', function(assert) {
  const msg = 'i am a message here that will be displayed in this component',
    numSeconds1 = 30,
    numSeconds2 = 60,
    numSeconds3 = 90;
  this.setProperties({ msg, numSeconds1, numSeconds2, numSeconds3 });

  this.render(
    hbs`{{audio-control/display message=msg currentNumSeconds=numSeconds1 maxNumSeconds=numSeconds2}}`
  );

  assert.ok(this.$('.audio-control__display').length, 'did render');
  assert.ok(this.$('.audio-control__display__progress').length, 'has progress bar');
  // TODO fix
  // assert.ok(
  //   this.$('.audio-control__display__progress')
  //     .attr('style')
  //     .includes(numSeconds1 / numSeconds2)
  // );
  let text = this.$()
    .text()
    .trim();
  assert.ok(text.includes(formatSecondsAsTimeElapsed(numSeconds1)));
  assert.ok(text.includes(formatSecondsAsTimeElapsed(numSeconds2)));

  this.render(
    hbs`{{audio-control/display message=msg currentNumSeconds=numSeconds3 maxNumSeconds=numSeconds2}}`
  );

  assert.ok(this.$('.audio-control__display').length, 'did render');
  assert.ok(this.$('.audio-control__display__progress').length, 'has progress bar');
  assert.ok(
    this.$('.audio-control__display__progress')
      .attr('style')
      .includes('100%')
  );
  text = this.$()
    .text()
    .trim();
  assert.notOk(
    text.includes(formatSecondsAsTimeElapsed(numSeconds3)),
    'current time cannot exceed max time'
  );
  assert.ok(text.includes(formatSecondsAsTimeElapsed(numSeconds2)));
});

test('select handler within bounds', function(assert) {
  const onSelect = sinon.spy();
  this.setProperties({ onSelect });
  this.render(hbs`{{audio-control/display message="hi" onSelect=onSelect}}`);

  assert.ok(this.$('.audio-control__display').length, 'did render');

  const $display = this.$('.audio-control__display'),
    selectPosition = 0.5;
  // from https://qunitjs.com/cookbook/#testing-user-actions
  this.$('.audio-control__display').trigger(
    Ember.$.Event('click', buildInBoundCoords($display, selectPosition))
  );

  assert.ok(onSelect.calledOnce);
  assert.equal(onSelect.firstCall.args[0], selectPosition);

  this.$('.audio-control__display').trigger(
    Ember.$.Event('touchend', { touches: [buildInBoundCoords($display, selectPosition)] })
  );

  assert.ok(onSelect.calledTwice);
  assert.equal(onSelect.secondCall.args[0], selectPosition);
});

test('select handler out of bounds', function(assert) {
  const onSelect = sinon.spy();
  this.setProperties({ onSelect });
  this.render(hbs`{{audio-control/display message="hi" onSelect=onSelect}}`);

  assert.ok(this.$('.audio-control__display').length, 'did render');

  const $display = this.$('.audio-control__display');
  // from https://qunitjs.com/cookbook/#testing-user-actions
  this.$('.audio-control__display').trigger(
    Ember.$.Event('click', buildOutOfBoundCoords($display))
  );

  assert.ok(onSelect.notCalled);

  this.$('.audio-control__display').trigger(
    Ember.$.Event('touchend', { touches: [buildOutOfBoundCoords($display)] })
  );

  assert.ok(onSelect.notCalled);
});

// Helpers
// -------

function buildInBoundCoords($obj, selectPosition) {
  const { left, top, height, width } = $obj[0].getBoundingClientRect();
  return { clientX: left + width * selectPosition, clientY: top + height / 2 };
}

function buildOutOfBoundCoords($obj) {
  const { left, top, height, width } = $obj[0].getBoundingClientRect();
  return { clientX: left + width * 0.2, clientY: top + height * 2 };
}
