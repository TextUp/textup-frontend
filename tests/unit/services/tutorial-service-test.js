import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import sinon from 'sinon';
import StorageUtils from 'textup-frontend/utils/storage';
import wait from 'ember-test-helpers/wait';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:tutorial-service', 'Unit | Service | tutorial service', {
  beforeEach() {
    this.register('service:notifications', Ember.Service);
    this.register(
      'service:authService',
      Ember.Service.extend(Ember.Evented, { authUser: { username: 'someUsername' } })
    );

    this.inject.service('notifications');
    this.inject.service('authService');
  },
});

test('it exists', function(assert) {
  const service = this.subject();
  assert.ok(service.tasks);
  service.tasks.forEach((task, index) => {
    assert.ok(task.id);
    assert.ok(task.title);
    assert.ok(task.text);
    assert.equal(task.stepNumber, index + 1);
    assert.notStrictEqual(task.status, null, 'task status is null for task ' + task.id);
  });
});

test('logging out and logging in', function(assert) {
  const service = this.subject(),
    done = assert.async();

  this.authService.set('authUser', { username: 'un1' });
  this.authService.trigger(config.events.auth.success);
  this.notifications.setProperties({ info: sinon.spy() });

  service.resetTasks();
  wait()
    .then(() => {
      assert.equal(service.get('shouldShowTaskManager'), true);

      service.closeTaskManager();
      return wait();
    })
    .then(() => {
      assert.equal(service.get('shouldShowTaskManager'), false);

      this.authService.set('authUser', { username: 'un2' });
      this.authService.trigger(config.events.auth.success);
      return wait();
    })
    .then(() => {
      assert.equal(service.get('shouldShowTaskManager'), true);

      done();
    });
});

test('_setTaskStatus and getTaskStatus', function(assert) {
  const service = this.subject(),
    getItem = sinon.stub(window.localStorage, 'getItem'),
    setItem = sinon.stub(window.localStorage, 'setItem');

  service.resetTasks();
  getItem.resetHistory();
  setItem.resetHistory();

  getItem.returns('random string');
  assert.equal(service.getTaskStatus(Constants.TASK.CONTACT), false);
  assert.equal(getItem.callCount, 1);
  assert.ok(getItem.firstCall.args[0].includes(Constants.TASK.CONTACT));

  getItem.returns(StorageUtils.FALSE);
  assert.equal(service.getTaskStatus(Constants.TASK.CONTACT), false);

  getItem.returns(StorageUtils.TRUE);
  assert.equal(service.getTaskStatus(Constants.TASK.CONTACT), true);

  service._setTaskStatus(Constants.TASK.CONTACT, true);
  assert.equal(setItem.callCount, 1);
  assert.ok(setItem.firstCall.args[1]);
  assert.ok(setItem.firstCall.args[0].includes(Constants.TASK.CONTACT));

  getItem.restore();
  setItem.restore();
});

test('startCompleteTask with different Ids', function(assert) {
  const service = this.subject(),
    completeTask = sinon.spy(),
    done = assert.async(),
    taskManager = { actions: { startCompleteTask: completeTask } },
    taskId = 'taskId',
    firstIncomplete = { id: taskId };

  service.setProperties({ taskManager, firstIncompleteTask: firstIncomplete });

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
  const service = this.subject();

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
  const service = this.subject();
  service.resetTasks();
  service.tasks.forEach(task => {
    const firstIncomplete = service.get('firstIncompleteTask');
    assert.strictEqual(task, firstIncomplete);
    service.finishCompleteTask(task.id);
  });
  service.resetTasks();
});

test('closeTaskManager', function(assert) {
  const service = this.subject(),
    info = sinon.spy(),
    done = assert.async();

  this.notifications.setProperties({ info });

  service.closeTaskManager();
  wait().then(() => {
    assert.strictEqual(
      service._shouldShowTaskManager,
      false,
      'after closing, should show is false'
    );
    assert.strictEqual(info.calledOnce, true, 'notification service is called');

    done();
  });
});
