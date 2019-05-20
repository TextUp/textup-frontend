import $ from 'jquery';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('datetime-control', 'Integration | Component | datetime control', {
  integration: true,
});

test('rendering different configurations', function(assert) {
  // default both date and time
  this.render(hbs`{{datetime-control}}`);
  assert.equal(this.$('input').length, 2, 'two inputs, one for time and one for date');
  assert.equal(
    this.$('input')
      .eq(0)
      .attr('placeholder'),
    'Select date',
    'first input is for selecting date'
  );
  assert.equal(
    this.$('input')
      .eq(1)
      .attr('placeholder'),
    'Select time',
    'second input is for selecting time'
  );

  // only date
  this.render(hbs`{{datetime-control showDate=true showTime=false}}`);
  assert.equal(this.$('input').length, 1, 'only one input for date');
  assert.equal(this.$('input').attr('placeholder'), 'Select date', 'input is for selecting date');

  // only time
  this.render(hbs`{{datetime-control showDate=false showTime=true}}`);
  assert.equal(this.$('input').length, 1, 'only one input for time');
  assert.equal(this.$('input').attr('placeholder'), 'Select time', 'input is for selecting time');
});

test('rendering disabled', function(assert) {
  this.render(hbs`{{datetime-control disabled=true}}`);
  assert.equal(this.$('input').length, 2, 'two inputs, one for time and one for date');

  const $inputs = this.$('input'),
    done = assert.async(1);
  // click on the input after a delay because without a delay
  // the aria-expanded responds as if NOT disabled. Therefore, we
  // put in a delay to better simulate a more realstic interaction
  // after a slight delay.
  setTimeout(function() {
    $inputs.each(function() {
      const $input = $(this);
      // before click
      assert.equal($input.prop('disabled'), true, 'is disabled before click');
      assert.equal($input.attr('aria-expanded'), 'false', 'is not expanded before click');
      assert.equal($input.attr('aria-readonly'), 'false', 'is not readonly before click');
      // clicking the disabled input
      $input.click();
      // after click
      assert.equal($input.prop('disabled'), true, 'is disabled after click');
      assert.equal($input.attr('aria-expanded'), 'false', 'is not expanded after click');
      assert.equal($input.attr('aria-readonly'), 'false', 'is not readonly after click');
    });
    done();
  }, 500);
});

test('rendering with various formats and placeholders', function(assert) {
  const datePlaceholder = 'I am a date placeholder',
    timePlaceholder = 'I am a time placeholder',
    dateFormat = 'zzz',
    timeFormat = 'zzz',
    done = assert.async();

  this.setProperties({
    datePlaceholder,
    timePlaceholder,
    dateFormat,
    timeFormat,
  });

  this.render(
    hbs`{{datetime-control datePlaceholder=datePlaceholder
      timePlaceholder=timePlaceholder
      dateFormat=dateFormat
      timeFormat=timeFormat
      value=value}}`
  );

  let $dateInput = this.$('input').eq(0),
    $timeInput = this.$('input').eq(1);

  // check placeholder before we specify any values
  assert.equal($dateInput.attr('placeholder'), datePlaceholder, 'date placeholder');
  assert.equal($dateInput.val(), '', 'date has no value yet');
  assert.equal($timeInput.attr('placeholder'), timePlaceholder, 'time placeholder');
  assert.equal($timeInput.val(), '', 'time has no value yet');

  // select a value to see formats in action
  $dateInput.click();
  setTimeout(() => {
    assert.equal($dateInput.attr('aria-expanded'), 'true', 'aria is expanded after clicking');
    const ownsId = $dateInput.attr('aria-owns');
    $(`#${ownsId} td > div`).click();
    assert.equal($dateInput.val(), dateFormat, 'date is expressed via provided custom format');
    assert.equal($timeInput.val(), timeFormat, 'time is expressed via provided custom format');

    // reset passed-in format to valid formats WILL NOT RESULT in
    // a component update unless we manually re-render
    const value = new Date(Date.now());
    this.setProperties({
      dateFormat: 'ddd mmm d, yyyy',
      timeFormat: 'h:i A',
      value,
    });
    // still stays original format
    assert.equal(
      $dateInput.val(),
      dateFormat,
      'date is remains the custom format, not the new format'
    );
    assert.equal(
      $timeInput.val(),
      timeFormat,
      'time is remains the custom format, not the new format'
    );

    // when we re-render the component
    this.render(
      hbs`{{datetime-control datePlaceholder=datePlaceholder
      timePlaceholder=timePlaceholder
      dateFormat=dateFormat
      timeFormat=timeFormat
      value=value}}`
    );
    $dateInput = this.$('input').eq(0);
    $timeInput = this.$('input').eq(1);
    // and the values displayed are according to our passed-in formats
    // NOTE that moment.js uses different format strings than the
    // ones used for pickadate.js
    assert.equal($dateInput.val(), moment(value).format('ddd MMM D, YYYY'), 'date format matches');
    assert.equal($timeInput.val(), moment(value).format('h:mm A'), 'time format matches');

    done();
  }, 500);
});

test('rendering different time intervals', function(assert) {
  const value = new Date(Date.now()),
    timeInterval = 17, // in minutes
    done = assert.async();
  this.setProperties({
    timeInterval,
    value,
  });
  this.render(hbs`{{datetime-control value=value timeInterval=timeInterval}}`);
  const $timeInput = this.$('input').eq(1);
  // open the time picker
  $timeInput.click();
  setTimeout(() => {
    assert.equal($timeInput.attr('aria-expanded'), 'true', 'picker is expanded after selecting');
    // and check offsets for all time option items
    let prevValue = null;
    $(`#${$timeInput.attr('aria-owns')} li`).each(function() {
      const itemValue = $(this).data('pick');
      // don't run assertion for first item (val is 0) and last item (value is undefined)
      if (itemValue) {
        assert.equal(itemValue - prevValue, timeInterval, 'time options have appropriate offset');
      }
      prevValue = itemValue;
    });
    done();
  }, 500);
});

test('minimum and maximum boundaries', function(assert) {
  const min = moment().subtract(1, 'hour'),
    max = moment().add(2, 'days'),
    done = assert.async();
  this.setProperties({
    min: min.toDate(),
    max: max.toDate(),
  });
  this.render(hbs`{{datetime-control min=min max=max}}`);
  const $dateInput = this.$('input').eq(0),
    $timeInput = this.$('input').eq(1);

  // date picker boundaries
  $dateInput.click();
  setTimeout(() => {
    assert.equal($dateInput.attr('aria-expanded'), 'true', 'date input expanded after selecting');
    assert.equal($timeInput.attr('aria-expanded'), 'false', 'time input not expanded');

    const minDate = min.clone().startOf('day'),
      maxDate = max.clone().startOf('day');
    // need the div because the footer has a non-selected button
    // that has the same date valuea as the currently-selected
    // calendar date entry
    $(`#${$dateInput.attr('aria-owns')} div[data-pick]`).each(function() {
      const day = moment(parseInt(this.dataset.pick));
      if (day.isBefore(minDate) || day.isAfter(maxDate)) {
        assert.equal(
          this.attributes['aria-disabled'].value,
          'true',
          'date before minimum is disabled'
        );
      } else if (day.isSame(minDate)) {
        assert.ok(
          !this.attributes['aria-disabled'],
          "day of minimum is NOT disabled b/c this attribute doesn't exist here"
        );
      } else if (day.isAfter(minDate) && day.isSameOrBefore(maxDate)) {
        assert.ok(!this.attributes['aria-disabled'], 'date between min and max is NOT disabled');
      }
    });

    // time picker boundaries
    $timeInput.click();
    setTimeout(() => {
      assert.equal($timeInput.attr('aria-expanded'), 'true', 'time input expanded after selecting');
      assert.equal($dateInput.attr('aria-expanded'), 'false', 'date input not expanded');
      // before a value is being selected
      assert.equal(
        $(`#${$timeInput.attr('aria-owns')} [data-pick]`)
          .eq(0)
          .data('pick'),
        0,
        'before selecting a value, the time picker does not show min because not sure what day it is'
      );

      // select minimum date from the date picker
      $dateInput.click();
      setTimeout(() => {
        $(`#${$dateInput.attr('aria-owns')} div[data-pick]:not([aria-disabled])`)
          .first()
          .click();

        // with the min date selected, the time picker now shows minimum
        $timeInput.click();
        assert.ok(
          $(`#${$timeInput.attr('aria-owns')} [data-pick]`)
            .eq(0)
            .data('pick') >
            min.hour() * 60,
          'with date set to same day as minimum, time range is now constrained'
        );

        // select maximum date from date picker
        $dateInput.click();
        setTimeout(() => {
          $(`#${$dateInput.attr('aria-owns')} div[data-pick]:not([aria-disabled])`)
            .last()
            .click();

          // with the max date selected, the time picker now shows maximum
          $timeInput.click();
          assert.ok(
            $(`#${$timeInput.attr('aria-owns')} [data-pick]`)
              .last()
              .data('pick') <
              (max.hour() + 1) * 60,
            'with date set to same day as max, time range is now constrained'
          );

          done();
        }, 500);
      }, 500);
    }, 500);
  }, 500);
});

test('handling change', function(assert) {
  // after selecting date -> datePick assertion once
  // after selecting time -> datePick assertion then timePick assertion
  assert.expect(3);

  const onSelect = function(newDate) {
    const newVal = moment(newDate);
    if (datePick) {
      assert.ok(
        newVal
          .clone()
          .startOf('day')
          .isSame(moment(datePick)),
        'new value reflects selected date'
      );
    }
    if (timePick) {
      assert.ok(
        newVal.isSame(
          newVal
            .clone()
            .hours(Math.floor(timePick / 60))
            .minutes(timePick % 60)
        ),
        'new value reflects selected time'
      );
    }
  };
  let datePick, timePick;
  this.setProperties({ onSelect });
  this.render(hbs`{{datetime-control onSelect=onSelect}}`);
  const $dateInput = this.$('input').eq(0),
    $timeInput = this.$('input').eq(1);

  // select date
  $dateInput.click();
  const $dateToSelect = $(
    `#${$dateInput.attr('aria-owns')} div[data-pick]:not([aria-disabled])`
  ).first();
  datePick = $dateToSelect.data('pick');
  $dateToSelect.click();

  // select time
  $timeInput.click();
  const $timeToSelect = $(`#${$timeInput.attr('aria-owns')} [data-pick]`).eq(4);
  timePick = $timeToSelect.data('pick');
  $timeToSelect.click();
});

test('adjusting time that falls after the last available time selection', function(assert) {
  const valueMoment = moment().endOf('day');

  this.setProperties({ value: valueMoment.toDate() });
  this.render(hbs`{{datetime-control value=value}}`);

  assert.ok(this.$('.datetime-control').length, 'did render');

  const displayedTime = this.$('input')
    .eq(1)
    .val();
  assert.ok(displayedTime, 'has displayed time');

  const displayedMoment = moment(displayedTime, 'hh:mm A');
  assert.ok(displayedMoment.isBefore(valueMoment));
});
