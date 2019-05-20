import { getOwner } from '@ember/application';
import Route from '@ember/routing/route';
import Evented from '@ember/object/evented';
import Service from '@ember/service';
import { typeOf } from '@ember/utils';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import sinon from 'sinon';
import StorageUtils from 'textup-frontend/utils/storage';
import TestUtils from 'textup-frontend/tests/helpers/utilities';
import wait from 'ember-test-helpers/wait';
import { moduleFor, test } from 'ember-qunit';

let authId;

moduleFor('service:tutorial-service', 'Unit | Service | tutorial service', {
  needs: ['service:analytics'],
  beforeEach() {
    authId = Math.random();
    this.register(
      'service:authService',
      Service.extend(Evented, {
        authUser: TestUtils.mockModel(authId, Constants.MODEL.STAFF, { username: 'someUsername' }),
      })
    );
    this.inject.service('authService');
    this.register('service:notification-messages-service', Service);
    this.inject.service('notification-messages-service', { as: 'notifications' });
    this.register(
      'service:storageService',
      Service.extend({ getItem: sinon.stub(), setItem: sinon.spy() })
    );
    this.inject.service('storageService');

    this.register('route:main', Route);
  },
});

test('`_shouldShowTaskManager` is set on initialization and on future logins', function(assert) {
  const service = this.subject(),
    _setShouldShowFromStorage = sinon.stub(service, '_setShouldShowFromStorage');

  service.setUpTutorial();

  assert.ok(_setShouldShowFromStorage.calledOnce, 'called on init already');

  this.authService.trigger(config.events.auth.success);

  assert.ok(_setShouldShowFromStorage.calledTwice, 'called on all future log-ins too');

  _setShouldShowFromStorage.restore();
});

test('logging out and logging in', function(assert) {
  const service = this.subject(),
    done = assert.async();

  service.setUpTutorial();
  this.authService.set('authUser.username', 'un1');
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

      this.authService.set('authUser.username', 'un2');
      this.authService.trigger(config.events.auth.success);
      return wait();
    })
    .then(() => {
      assert.equal(service.get('shouldShowTaskManager'), true);

      done();
    });
});

test('task data data structure', function(assert) {
  const service = this.subject();
  assert.ok(service.get('tasks'));
  service.get('tasks').forEach((task, index) => {
    assert.ok(task.id);
    assert.ok(task.title);
    assert.ok(task.text);
    assert.equal(task.stepNumber, index + 1);
    assert.notStrictEqual(task.status, null, 'task status is null for task ' + task.id);
  });
});

test('_setTaskStatus and getTaskStatus', function(assert) {
  const service = this.subject();

  service.resetTasks();
  this.storageService.getItem.resetHistory();
  this.storageService.setItem.resetHistory();

  this.storageService.getItem.returns('random string');
  assert.equal(service.getTaskStatus(Constants.TASK.CONTACT), false);
  assert.equal(this.storageService.getItem.callCount, 1);
  assert.ok(this.storageService.getItem.firstCall.args[0].includes(Constants.TASK.CONTACT));

  this.storageService.getItem.returns(StorageUtils.FALSE);
  assert.equal(service.getTaskStatus(Constants.TASK.CONTACT), false);

  this.storageService.getItem.returns(StorageUtils.TRUE);
  assert.equal(service.getTaskStatus(Constants.TASK.CONTACT), true);

  service._setTaskStatus(Constants.TASK.CONTACT, true);
  assert.equal(this.storageService.setItem.callCount, 1);
  assert.ok(this.storageService.setItem.firstCall.args[1]);
  assert.ok(this.storageService.setItem.firstCall.args[0].includes(Constants.TASK.CONTACT));
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
  const service = this.subject(),
    taskKey = sinon.stub(StorageUtils, 'taskKey').returnsArg(1);

  service.resetTasks();
  service.get('tasks').forEach(task => {
    const id = task.id;
    this.storageService.getItem.withArgs(id).returns(StorageUtils.FALSE);
    assert.strictEqual(service.getTaskStatus(id), false);

    service.finishCompleteTask(id);
    assert.ok(this.storageService.setItem.calledWith(id, StorageUtils.TRUE));
    this.storageService.getItem.withArgs(id).returns(StorageUtils.TRUE);
    assert.strictEqual(service.getTaskStatus(id), true);
  });

  this.storageService.getItem.resetHistory();
  this.storageService.setItem.resetHistory();

  service.resetTasks();
  service.get('tasks').forEach(task => {
    const id = task.id;
    assert.ok(this.storageService.setItem.calledWith(id, StorageUtils.FALSE));
    this.storageService.getItem.withArgs(id).returns(StorageUtils.FALSE);
    assert.strictEqual(service.getTaskStatus(id), false);
  });

  taskKey.restore();
});

test('firstIncompleteTask', function(assert) {
  const service = this.subject(),
    taskKey = sinon.stub(StorageUtils, 'taskKey').returnsArg(1);

  service.resetTasks();
  service.get('tasks').forEach(task => {
    assert.ok(this.storageService.setItem.calledWith(task.id, StorageUtils.FALSE));

    const firstIncomplete = service.get('firstIncompleteTask');
    assert.strictEqual(task, firstIncomplete);

    service.finishCompleteTask(task.id);
    assert.ok(this.storageService.setItem.calledWith(task.id, StorageUtils.TRUE));
  });
  service.resetTasks();

  taskKey.restore();
});

test('closeTaskManager', function(assert) {
  const service = this.subject(),
    info = sinon.spy(),
    clearAll = sinon.spy(),
    done = assert.async(),
    mainRoute = getOwner(this).lookup('route:main'),
    send = sinon.stub(mainRoute, 'send');

  this.notifications.setProperties({ info, clearAll });

  service.closeTaskManager();
  wait().then(() => {
    assert.strictEqual(
      service._shouldShowTaskManager,
      false,
      'after closing, should show is false'
    );
    assert.strictEqual(info.calledOnce, true, 'notification service is called');

    assert.equal(info.firstCall.args[1].htmlContent, true);
    assert.equal(typeOf(info.firstCall.args[1].onClick), 'function');

    info.firstCall.args[1].onClick.call();
    assert.ok(send.calledWith('startFeedbackSlideout'));
    assert.ok(
      clearAll.calledOnce,
      'clear notifications when opening feedback slideout to avoid re-triggering the feedback slideout if te user presses on the notification again'
    );

    send.restore();
    done();
  });
});
