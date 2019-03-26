import Constants from 'textup-frontend/constants';
import { mockModel } from 'textup-frontend/tests/helpers/utilities';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:schedule-service', 'Unit | Service | schedule service');

test('replacing range', function(assert) {
  const service = this.subject(),
    scheduleObj = mockModel(1, Constants.MODEL.SCHEDULE),
    newData = Math.random();

  service.replaceRange(); // no error thrown

  service.replaceRange(scheduleObj, 'blah', newData);
  assert.notEqual(scheduleObj.get('blah'), newData);

  service.replaceRange(scheduleObj, Constants.DAYS_OF_WEEK[0], newData);
  assert.equal(scheduleObj.get(Constants.DAYS_OF_WEEK[0]), newData);
});
