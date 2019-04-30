import StorageUtils from 'textup-frontend/utils/storage';
import { module, test } from 'qunit';

module('Unit | Utility | storage');

test('task manager key', function(assert) {
  const username = Math.random() + '';

  assert.ok(StorageUtils.showManagerKey(username).includes(username));
});

test('task key', function(assert) {
  const username = Math.random() + '',
    taskId = Math.random() + '';

  assert.ok(StorageUtils.taskKey(username, taskId).includes(username));
  assert.ok(StorageUtils.taskKey(username, taskId).includes(taskId));
});

test('tour key', function(assert) {
  const username = Math.random() + '';

  assert.ok(StorageUtils.tourKey(username).includes(username));
});
