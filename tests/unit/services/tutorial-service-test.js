import { moduleFor, test } from 'ember-qunit';

moduleFor('service:tutorial-service', 'Unit | Service | tutorial service', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service.tasks);
  service.tasks.forEach((task, index) => {
    assert.ok(task.id);
    assert.ok(task.title);
    assert.ok(task.text);
    assert.equal(task.stepNumber, index + 1);
    assert.notStrictEqual(task.status, null, 'task status is null for task ' + task.id);
  });
});

test('_setTaskStatus and getTaskStatus', function(assert) {
  let service = this.subject();
  service._setTaskStatus('addContact', true);
  assert.strictEqual(service.getTaskStatus('addContact'), true);
  service._setTaskStatus('addContact', false);
  assert.strictEqual(service.getTaskStatus('addContact'), false);
});

test('completeTask and resetTasks', function(assert) {
  let service = this.subject();
  service.resetTasks();
  service.tasks.forEach(task => {
    const id = task.id;
    assert.strictEqual(service.getTaskStatus(id), false);
    service.completeTask(id);
    assert.strictEqual(service.getTaskStatus(id), true);
  });
  service.resetTasks();
  service.tasks.forEach(task => {
    const id = task.id;
    assert.strictEqual(service.getTaskStatus(id), false);
  });
});

test('firstIncompleteTask', function(assert) {
  let service = this.subject();
  service.resetTasks();
  service.tasks.forEach(task => {
    const firstIncomplete = service.get('firstIncompleteTask');
    assert.strictEqual(task, firstIncomplete);
    service.completeTask(task.id);
  });
  service.resetTasks();
});
