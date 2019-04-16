import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

moduleFor('service:tutorial-service', 'Unit | Service | tutorial service', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
  beforeEach() {
    this.register(
      'service:auth-service',
      Ember.Service.extend({
        authUser: {
          username: 'someUsername'
        }
      })
    );
  }
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
  const getItem = sinon.stub(window.localStorage, 'getItem'),
    setItem = sinon.stub(window.localStorage, 'setItem');

  let service = this.subject();
  service.resetTasks();

  getItem.resetHistory();
  setItem.resetHistory();
  getItem.returns('random string');
  assert.equal(service.getTaskStatus('addContact'), false);
  assert.equal(getItem.callCount, 1);
  assert.ok(getItem.firstCall.args[0].includes('addContact'));

  getItem.returns('false');
  assert.equal(service.getTaskStatus('addContact'), false);

  getItem.returns('true');
  assert.equal(service.getTaskStatus('addContact'), true);

  service._setTaskStatus('addContact', true);
  assert.equal(setItem.callCount, 1);
  assert.ok(setItem.firstCall.args[1]);
  assert.ok(setItem.firstCall.args[0].includes('addContact'));

  getItem.restore();
  setItem.restore();
});

test('startCompleteTask with different Ids', function(assert) {
  let service = this.subject();
  const completeTask = sinon.spy(),
    done = assert.async();
  const taskManager = {
    actions: {
      startCompleteTask: completeTask
    }
  };
  const taskId = 'taskId';
  const firstIncomplete = {
    id: taskId
  };

  service.taskManager = taskManager;
  service._firstIncompleteTask = firstIncomplete;

  service.startCompleteTask('wrongTask');
  wait()
    .then(() => {
      assert.ok(completeTask.notCalled, 'completeTask in taskManager is not called');
      service.startCompleteTask(taskId);
      return wait();
    })
    .then(() => {
      assert.ok(completeTask.calledOnce, 'completeTask in taskManager is called');
      done();
    });
});

test('completeTask and resetTasks', function(assert) {
  let service = this.subject();
  service.resetTasks();
  service.tasks.forEach(task => {
    const id = task.id;
    assert.strictEqual(service.getTaskStatus(id), false);
    service.finishCompleteTask(id);
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
    const firstIncomplete = service.get('_firstIncompleteTask');
    assert.strictEqual(task, firstIncomplete);
    service.finishCompleteTask(task.id);
  });
  service.resetTasks();
});

test('closeTaskManager', function(assert) {
  let service = this.subject();
  assert.strictEqual(service.shouldShowTaskManagerInternal, true, 'init with shouldshow is true');
  const info = sinon.spy(),
    done = assert.async();
  service.notifications = {
    info: info
  };
  service.closeTaskManager();
  wait().then(() => {
    assert.strictEqual(
      service.shouldShowTaskManagerInternal,
      false,
      'after closing, should show is false'
    );
    assert.strictEqual(info.calledOnce, true, 'notification service is called');
    done();
  });
});
