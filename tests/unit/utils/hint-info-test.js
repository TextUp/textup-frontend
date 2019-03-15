import * as HintUtil from 'textup-frontend/utils/hint-info';
import { module, test } from 'qunit';

module('Unit | Utility | hint info');

// Replace this with your real tests.
test('getTitle and getMessage', function(assert) {
  let title = HintUtil.getTitle('testHint1');
  assert.equal(title, 'Test Hint 1');
  let message = HintUtil.getMessage('testHint1');
  assert.equal(message, 'This is a super super super super super super long test hint');

  title = HintUtil.getTitle('non existent test key');
  message = HintUtil.getMessage('non existent test key');
  assert.strictEqual(title, 'Error');
  assert.strictEqual(message, '');
});
