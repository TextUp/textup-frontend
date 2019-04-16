import * as TaskUtil from 'textup-frontend/utils/task-info';
import TaskData from 'textup-frontend/data/task-data';
import { module, test } from 'qunit';

module('Unit | Utility | task info');

// Replace this with your real tests.
test('make sure task util returns all data', function(assert) {
  assert.strictEqual(TaskUtil.getTasks(), TaskData);
});

test('make sure all fields of all tasks are populated', function(assert) {
  TaskData.forEach(task => {
    assert.ok(task['id']);
    assert.ok(task['title']);
    assert.ok(task['text']);
    assert.ok(task['elementsToPulse']);
    assert.ok(task['elementsToPulseMobile']);
  });
});
