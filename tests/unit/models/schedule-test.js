import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import ScheduleUtils from 'textup-frontend/utils/schedule';
import sinon from 'sinon';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('schedule', 'Unit | Model | schedule', {
  needs: ['transform:interval-string'],
});

test('default properties', function(assert) {
  const model = this.subject();

  assert.equal(model.get('manual'), true);
  assert.equal(model.get('manualIsAvailable'), true);
});

test('defining interval properties for each day of week', function(assert) {
  const model = this.subject(),
    val1 = Math.random(),
    val2 = Math.random(),
    stringToIntervals = sinon.stub(ScheduleUtils, 'stringToIntervals').returns(val1),
    intervalsToString = sinon.stub(ScheduleUtils, 'intervalsToString').returns(val2);

  Constants.DAYS_OF_WEEK.forEach(dayOfWeek => {
    assert.ok(model[dayOfWeek] instanceof Ember.ComputedProperty);
  });

  assert.ok(stringToIntervals.notCalled);
  assert.ok(intervalsToString.notCalled);

  run(() => {
    Constants.DAYS_OF_WEEK.forEach(dayOfWeek => {
      assert.equal(model.get(dayOfWeek), val1);
      assert.ok(stringToIntervals.calledOnce);

      model.set(dayOfWeek, 'hi');
      assert.ok(intervalsToString.calledOnce);
      assert.ok(intervalsToString.firstCall.calledWith('hi'));
      assert.equal(model.get(dayOfWeek + 'String'), val2);

      stringToIntervals.resetHistory();
      intervalsToString.resetHistory();
    });
  });

  stringToIntervals.restore();
  intervalsToString.restore();
});
