import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('schedule-control', 'Integration | Component | schedule control', {
  integration: true,
});

test('rendering without any data', function(assert) {
  const daysOfWeek = Ember.getOwner(this)
    .lookup('service:constants')
    .get('DAYS_OF_WEEK');

  assert.throws(() => this.render(hbs`{{schedule-control}}`), 'requires schedule');

  // with schedule class
  this.set('scheduleObj', Ember.Object.create({}));
  this.render(hbs`{{schedule-control schedule=scheduleObj}}`);

  const renderedText = this.$()
    .text()
    .toLowerCase()
    .trim();
  assert.ok(daysOfWeek.every(day => renderedText.indexOf(day) > -1), 'Has all days of week');
  assert.ok(
    renderedText.indexOf('not available') > -1 && renderedText.indexOf('available from') === -1,
    'passed-in object has no data so all of the days should be not available'
  );
  assert.ok(renderedText.indexOf('show team availability') === -1, 'no team info');
  assert.ok(renderedText.indexOf('add an available time range') > -1, 'can add new range');
});

test('rendering a schedule withOUT team members', function(assert) {
  const daysOfWeek = Ember.getOwner(this)
      .lookup('service:constants')
      .get('DAYS_OF_WEEK'),
    initialData = {},
    scheduleClass = 'test-schedule-class';
  daysOfWeek.forEach(day => {
    initialData[day] = [['0130', '0835']];
  });
  this.set('scheduleObj', Ember.Object.create(initialData));
  this.set('scheduleClass', scheduleClass);

  this.render(hbs`{{schedule-control schedule=scheduleObj scheduleClass=scheduleClass}}`);

  const renderedText = this.$()
    .text()
    .toLowerCase()
    .trim();
  assert.ok(daysOfWeek.every(day => renderedText.indexOf(day) > -1), 'Has all days of week');
  assert.ok(
    renderedText.indexOf('not available') === -1 && renderedText.indexOf('available from') > -1,
    'all days have some available time range'
  );
  assert.ok(renderedText.indexOf('show team availability') === -1, 'no team info');
  assert.ok(renderedText.indexOf('add an available time range') > -1, 'can add new range');

  this.$(`.${scheduleClass} input`).each(function(index) {
    if (index % 2 === 0) {
      assert.strictEqual(this.value, '1:30 AM', 'even is starting time in range');
    } else {
      // note 9:00 not 8:35 because we display the first 30-minute time point AFTER the specified time
      assert.strictEqual(this.value, '9:00 AM', 'odd is starting time in range');
    }
  });
});

test('rendering a schedule WITH team members', function(assert) {
  const daysOfWeek = Ember.getOwner(this)
      .lookup('service:constants')
      .get('DAYS_OF_WEEK'),
    initialData = {},
    teamMemberData = {},
    scheduleClass = 'test-schedule-class',
    teamMemberName = 'I am your team member';
  daysOfWeek.forEach(day => {
    initialData[day] = [['0130', '0835']];
    teamMemberData[day] = [['1112', '2309']];
  });
  this.set('scheduleObj', Ember.Object.create(initialData));
  this.set('scheduleClass', scheduleClass);
  this.set('others', [
    Ember.Object.create({
      name: teamMemberName,
      schedule: {
        content: teamMemberData,
      },
    }),
  ]);

  this.render(
    hbs`{{schedule-control schedule=scheduleObj others=others scheduleClass=scheduleClass}}`
  );

  // Check initial state
  const renderedText = this.$()
    .text()
    .toLowerCase()
    .trim();
  assert.ok(daysOfWeek.every(day => renderedText.indexOf(day) > -1), 'Has all days of week');
  assert.ok(
    renderedText.indexOf('not available') === -1 && renderedText.indexOf('available from') > -1,
    'all days have some available time range'
  );
  assert.ok(
    renderedText.indexOf('show team availability') === -1,
    'does not have team info toggle because we have factored this out into a separate component passed in via the yield outlet'
  );
  assert.ok(renderedText.indexOf('add an available time range') > -1, 'can add new range');
  this.$(`.${scheduleClass} input`).each(function(index) {
    if (index % 2 === 0) {
      assert.strictEqual(this.value, '1:30 AM', 'even is starting time in range');
    } else {
      // note 9:00 not 8:35 because we display the first 30-minute time point AFTER the specified time
      assert.strictEqual(this.value, '9:00 AM', 'odd is starting time in range');
    }
  });
});

test('adding a range', function(assert) {
  const daysOfWeek = Ember.getOwner(this)
    .lookup('service:constants')
    .get('DAYS_OF_WEEK');
  assert.expect(14);

  // prep data for rendering schedule
  this.set('scheduleObj', Ember.Object.create({}));
  this.set('handleAdd', function(dayOfWeek, newRanges) {
    assert.equal(dayOfWeek, 'monday', 'day of week we are adding is monday');
    assert.equal(newRanges.length, 1, 'monday now has one range');
    assert.equal(newRanges[0][0], '0030', 'starting time is 12:30 AM');
    assert.equal(newRanges[0][1], '0530', 'ending time is 5:30 AM');
  });

  // render schedule
  this.render(hbs`{{schedule-control schedule=scheduleObj onChange=handleAdd}}`);
  const renderedText = this.$()
    .text()
    .toLowerCase()
    .trim();
  assert.ok(daysOfWeek.every(day => renderedText.indexOf(day) > -1), 'Has all days of week');
  assert.ok(
    renderedText.indexOf('not available') > -1 && renderedText.indexOf('available from') === -1,
    'passed-in object has no data so all of the days should be not available'
  );
  assert.ok(renderedText.indexOf('show team availability') === -1, 'no team info');
  assert.ok(renderedText.indexOf('add an available time range') > -1, 'can add new range');

  // assert that adding menu contents are not being shown currently
  assert.equal(
    this.$('.ember-view select option').length,
    0,
    'no add day of week options are shown'
  );

  // open adding menu
  this.$('.ember-view button')
    .first()
    .triggerHandler('click');

  assert.ok(this.$('.ember-view select option').length > 0, 'adding menu is now opened');

  // select day of week
  this.$('.ember-view select option')
    .val(
      this.$('.ember-view select option')
        .eq(1)
        .val()
    )
    .trigger('change');

  // select start times
  const startInput = this.$('.ember-view input').first();
  startInput.click();
  Ember.$(`#${startInput.attr('aria-owns')} [data-pick="30"]`).click();

  // delay to allow the datetime-control to finish re-rendering
  const done = assert.async();
  setTimeout(function() {
    // set end time
    const endInput = this.$('.ember-view input').eq(1);
    endInput.click();
    Ember.$(`#${endInput.attr('aria-owns')} [data-pick="330"]`).click();

    // press add button after asserting that it is no longer disabled
    assert.ok(
      this.$('.schedule-add-range-btn').prop('disabled') === false,
      'button to add range is no longer disabled'
    );
    this.$('.schedule-add-range-btn').click(); // sets off add handler asserts

    // give some time for the add menu to close after the action handler is triggered
    setTimeout(() => {
      // opening again preserves the day of week
      assert.equal(this.$('.ember-view select option').length, 0, 'adding menu has closed');
      this.$('.ember-view button')
        .first()
        .triggerHandler('click');
      assert.ok(this.$('.ember-view select option').length > 0, 'adding menu is now opened');
      assert.equal(
        this.$('.ember-view select').val(),
        'monday',
        'previously added day of week is preserved'
      );
      done();
    }, 300);
  }, 500);
});

test('updating an existing range', function(assert) {
  const daysOfWeek = Ember.getOwner(this)
      .lookup('service:constants')
      .get('DAYS_OF_WEEK'),
    initialData = {},
    scheduleClass = 'test-schedule-class',
    done = assert.async(2);
  let expectedDayOfWeek, expectedNewStart, expectedNewEnd;
  daysOfWeek.forEach(day => (initialData[day] = [['0130', '0535']]));
  this.setProperties({
    scheduleClass,
    scheduleData: Ember.Object.create(initialData),
    handleUpdate(dayOfWeek, newRanges) {
      assert.equal(dayOfWeek, expectedDayOfWeek);
      assert.equal(newRanges[0][0], expectedNewStart);
      assert.equal(newRanges[0][1], expectedNewEnd);
      done();
    },
  });
  this.render(
    hbs`{{schedule-control schedule=scheduleData scheduleClass=scheduleClass onChange=handleUpdate}}`
  );

  // select thursday
  const $inputs = this.$(`.${scheduleClass} :nth-child(4) input`),
    $startInput = $inputs.eq(0),
    $endInput = $inputs.eq(1);

  // start editing start time
  $startInput.click();
  setTimeout(() => {
    assert.equal($startInput.attr('aria-expanded'), 'true', 'start time input open after clicking');

    // update start time to 7:15a
    expectedDayOfWeek = 'thursday';
    expectedNewStart = '0715';
    expectedNewEnd = '0715';
    Ember.$(`#${$startInput.attr('aria-owns')} [data-pick="435"]`).click();

    // delay to allow date-time control to re-render
    setTimeout(() => {
      // start editing end time
      $endInput.click();
      assert.equal($startInput.attr('aria-expanded'), 'false', 'start time input is closed');
      assert.equal($endInput.attr('aria-expanded'), 'true', 'end time input open after clicking');

      // SUPPOSEDLY, the end time has updated too and earliest possible end time to select should
      // now constrained by the start time of 7:15a
      // BUT this does not happen because our update handler doesn't actually update the start/end
      // values so we don't rebuild in this way
      // NOW, let's update end time to 5:30p
      expectedDayOfWeek = 'thursday';
      expectedNewStart = '0130'; // original time because we DIDN'T ACTUALLY UPDATE our values
      expectedNewEnd = '1730'; // just-selected 5:30p
      Ember.$(`#${$endInput.attr('aria-owns')} [data-pick="1050"]`).click();
      done();
    }, 500);
  }, 500);
});

test('deleting an existing range', function(assert) {
  const daysOfWeek = Ember.getOwner(this)
    .lookup('service:constants')
    .get('DAYS_OF_WEEK');

  assert.expect(2);
  const initialData = {},
    scheduleClass = 'test-schedule-class';
  daysOfWeek.forEach(day => (initialData[day] = [['0130', '0535']]));
  this.setProperties({
    scheduleClass,
    scheduleData: Ember.Object.create(initialData),
    handleDelete(dayOfWeek, newRanges) {
      assert.equal(dayOfWeek, 'thursday', 'deleting range for thursday');
      assert.equal(newRanges.length, 0, 'no more ranges after deleting');
    },
  });
  this.render(
    hbs`{{schedule-control schedule=scheduleData scheduleClass=scheduleClass onChange=handleDelete}}`
  );
  // select delete the first range from thursday
  this.$(`.${scheduleClass} :nth-child(4) button`).click();
});
