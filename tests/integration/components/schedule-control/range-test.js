import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import config from '../../../../config/environment';

moduleForComponent('schedule-control/range', 'Integration | Component | schedule control/range', {
  integration: true
});

test('rendering without any inputs', function(assert) {
  this.render(hbs`{{schedule-control/range}}`);

  assert.strictEqual(this.$('input')[0].value, '');
  assert.strictEqual(this.$('input')[1].value, '');
  assert.strictEqual(
    this.$()
      .text()
      .trim(),
    'to'
  );
});

test('rendering with invalidly formatted data', function(assert) {
  this.set('invalidData', ['1asdf98sd', 'asdf--=-asdf']);
  this.render(hbs`{{schedule-control/range data=invalidData}}`);

  const startHour = this.$('input')[0].value.slice(0, 2),
    endHour = this.$('input')[1].value.slice(0, 2),
    hourNum = new Date().getHours() % 12;

  // if completely invalid, return "Invalid Date" and defaults
  // to the current time rounded to the nearest 15 minute increment
  // so we also allow for the next hour because we might round up to the
  // nearest next hour
  assert.ok(startHour.indexOf(hourNum) > -1 || startHour.indexOf(hourNum + 1) > -1);
  assert.ok(endHour.indexOf(hourNum) > -1 || endHour.indexOf(hourNum + 1) > -1);
  assert.strictEqual(
    this.$()
      .text()
      .trim(),
    'to'
  );
});

test('rendering with unclean but valid data', function(assert) {
  this.set('invalidData', ['1asdf8sd']);
  this.render(hbs`{{schedule-control/range data=invalidData}}`);

  // pulls out any numbers possible, rounds to nearest 30 minute increment
  assert.strictEqual(this.$('input')[0].value, '1:30 AM');
  assert.strictEqual(this.$('input')[1].value, '');
  assert.strictEqual(
    this.$()
      .text()
      .trim(),
    'to'
  );
});

test('rendering with valid data', function(assert) {
  this.setProperties({
    validData: ['0128', '0810'],
    timeInterval: 30
  });
  this.render(hbs`{{schedule-control/range data=validData timeInterval=timeInterval}}`);

  // rounds to nearest 30 minutes
  assert.strictEqual(this.$('input')[0].value, '1:30 AM');
  // from starting point of 1:28AM, increment by 30 minute intervals until
  // we get to a time closest to 8:10AM
  assert.strictEqual(this.$('input')[1].value, '8:58 AM');
  assert.strictEqual(
    this.$()
      .text()
      .trim(),
    'to'
  );
});

test('handling change for start when end is undefined', function(assert) {
  this.setProperties({
    handleChange: newData => {
      assert.strictEqual(newData[0], '0030');
      assert.equal(newData[1], null);
    },
    timeInterval: 30
  });
  this.render(
    hbs`{{schedule-control/range onChange=(action handleChange) timeInterval=timeInterval}}`
  );

  selectTime(this, assert, 0, '[data-pick="30"]');
});

test('handling change for end', function(assert) {
  // when start is undefined
  this.setProperties({
    handleChange: newData => {
      assert.equal(newData[0], null);
      assert.strictEqual(newData[1], '0215');
    },
    timeInterval: 30
  });
  this.render(
    hbs`{{schedule-control/range onChange=(action handleChange) timeInterval=timeInterval}}`
  );
  selectTime(this, assert, 1, '[data-pick="135"]');

  // when start is defined
  const originalStart = '0125';
  this.setProperties({
    data: [originalStart],
    handleChange: newData => {
      assert.strictEqual(newData[0], originalStart);
      assert.strictEqual(newData[1], '0230');
    },
    timeInterval: 30
  });
  this.render(
    hbs`{{schedule-control/range data=data onChange=(action handleChange) timeInterval=timeInterval}}`
  );
  selectTime(this, assert, 1, '[data-pick="150"]');
});

test('handling change for start when end is after start', function(assert) {
  this.setProperties({
    data: ['0015', '0030'],
    handleChange: newData => {
      assert.strictEqual(newData[0], '0230');
      assert.strictEqual(newData[1], '0230');
    },
    timeInterval: 30
  });
  this.render(
    hbs`{{schedule-control/range data=data onChange=(action handleChange) timeInterval=timeInterval}}`
  );
  selectTime(this, assert, 0, '[data-pick="150"]');
});

test('handling change for start when end is before start', function(assert) {
  this.setProperties({
    data: ['0015', '0312'],
    handleChange: newData => {
      assert.strictEqual(newData[0], '0230');
      assert.strictEqual(newData[1], '0312');
    },
    timeInterval: 30
  });
  this.render(
    hbs`{{schedule-control/range data=data onChange=(action handleChange) timeInterval=timeInterval}}`
  );
  selectTime(this, assert, 0, '[data-pick="150"]');
});

// Helpers
// -------

// timeIndex = 0 is start time
// timeIndex = 1 is end time
function selectTime(component, assert, timeIndex, choiceSelector) {
  // not expanded before opening
  assert.strictEqual(
    component
      .$('input')
      .eq(timeIndex)
      .attr('aria-expanded'),
    'false'
  );

  // trigger the input opening
  component
    .$('input')
    .eq(timeIndex)
    .click();

  // is open after selecting the input
  assert.strictEqual(
    component
      .$('input')
      .eq(timeIndex)
      .attr('aria-expanded'),
    'true'
  );

  // select a list item to update the start time
  const ownsId = component
    .$('input')
    .eq(timeIndex)
    .attr('aria-owns');
  Ember.$(`${config.APP.rootElement} #${ownsId} ${choiceSelector}`).click();
}
