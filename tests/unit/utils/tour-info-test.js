import * as TourUtil from 'textup-frontend/utils/tour-info';
import { module, test } from 'qunit';

module('Unit | Utility | tour info');

// Replace this with your real tests.
test('get info', function(assert) {
  let title = TourUtil.getTitle('washRice');
  let text = TourUtil.getText('washRice');
  let stepNumber = TourUtil.getStepNumber('washRice');
  assert.strictEqual(title, 'Wash the rice');
  assert.strictEqual(text, 'Wash the rice until no cloudiness appears in the water');
  assert.strictEqual(stepNumber, 1);

  title = TourUtil.getTitle('addWater');
  text = TourUtil.getText('addWater');
  stepNumber = TourUtil.getStepNumber('addWater');
  assert.strictEqual(title, 'Add water');
  assert.strictEqual(text, 'Add 2 cups of water for every cup of rice');
  assert.strictEqual(stepNumber, 2);

  title = TourUtil.getTitle('cookRice');
  text = TourUtil.getText('cookRice');
  stepNumber = TourUtil.getStepNumber('cookRice');
  assert.strictEqual(title, 'Cook rice');
  assert.strictEqual(text, 'Use the appropriate mode on the rice cooker to cook the rice');
  assert.strictEqual(stepNumber, 3);

  title = TourUtil.getTitle('fluffRice');
  text = TourUtil.getText('fluffRice');
  stepNumber = TourUtil.getStepNumber('fluffRice');
  assert.strictEqual(title, 'Fluff rice');
  assert.strictEqual(text, 'Use a ladel to fold the rice and make it fluffy');
  assert.strictEqual(stepNumber, 4);

  title = TourUtil.getTitle('non existent key for test');
  text = TourUtil.getText('non existent key for test');
  stepNumber = TourUtil.getStepNumber('non existent key for test');
  assert.strictEqual(title, 'Error');
  assert.strictEqual(text, '');
  assert.strictEqual(stepNumber, 0);
});
