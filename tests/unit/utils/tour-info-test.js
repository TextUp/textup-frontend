import * as TourUtil from 'textup-frontend/utils/tour-info';
import TourData from 'textup-frontend/data/tour-data';
import { module, test } from 'qunit';

module('Unit | Utility | tour info');

// Replace this with your real tests.
test('get info', function(assert) {
  const resultsFromUtil = TourUtil.getTourSteps();
  assert.strictEqual(TourData, resultsFromUtil);
});
