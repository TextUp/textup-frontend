import config from 'textup-frontend/config/environment';
import Service, { inject as service } from '@ember/service';
import StorageUtils from 'textup-frontend/utils/storage';
import TaskData from 'textup-frontend/data/task-data';
import { assign } from '@ember/polyfills';
import { set, computed } from '@ember/object';

export const TASK_ID_KEY = 'id';
export const TASK_STATUS_KEY = 'status';
export const TASK_STEP_NUMBER_KEY = 'stepNumber';

export default Service.extend({
  authService: service(),
  notifications: service('notification-messages-service'),
  storageService: service(),
  slideout/supportService: service(),

  // Properties
  // ----------

  taskManager: null,
  tasks: computed(function() {
    const tasks = [];
    TaskData.forEach((task, index) => {
      tasks.pushObject(
        assign({}, task, {
          [TASK_STATUS_KEY]: this.getTaskStatus(task[TASK_ID_KEY]),
          [TASK_STEP_NUMBER_KEY]: index + 1,
        })
      );
    });
    return tasks;
  }),
  firstIncompleteTask: computed(`tasks.@each.${TASK_STATUS_KEY}`, function() {
    return this.get('tasks').find(task => task && task[TASK_STATUS_KEY] === false);
  }),
  shouldShowTaskManager: computed('_shouldShowTaskManager', function() {
    const shouldShow = this.get('_shouldShowTaskManager');
    return shouldShow === null || shouldShow;
  }),

  // Methods
  // -------

  setUpTutorial() {
    // initialize `_shouldShowTaskManager` and ensure it gets re-initialized on future logins
    this._setShouldShowFromStorage();
    this.get('authService').on(
      config.events.auth.success,
      this._setShouldShowFromStorage.bind(this)
    );
  },

  getTaskStatus(taskId) {
    return (
      this.get('storageService').getItem(
        StorageUtils.taskKey(this.get('authService.authUser'), taskId)
      ) === StorageUtils.TRUE
    );
  },
  startCompleteTask(taskId) {
    if (taskId === this.get('firstIncompleteTask.id')) {
      const taskManager = this.get('taskManager');
      if (taskManager) {
        taskManager.actions.startCompleteTask(taskId);
      }
    }
  },
  finishCompleteTask(taskId) {
    this._setTaskStatus(taskId, true);
  },
  closeTaskManager() {
    this.get('notifications').info(
      'Access the “Getting Started” tour at anytime through <button class="btn-link">the Support menu</button>.',
      { htmlContent: true, onClick: this._openSupportSlideout.bind(this) }
    );
    this.set('_shouldShowTaskManager', false);
    this.get('storageService').setItem(
      StorageUtils.showManagerKey(this.get('authService.authUser')),
      StorageUtils.FALSE
    );
  },
  resetTasks() {
    this.get('tasks').forEach(task => this._setTaskStatus(task[TASK_ID_KEY], false));
    this.get('storageService').setItem(
      StorageUtils.showManagerKey(this.get('authService.authUser')),
      StorageUtils.TRUE
    );
    this.set('_shouldShowTaskManager', true);
  },

  // Internal
  // --------

  _shouldShowTaskManager: null,

  _setShouldShowFromStorage() {
    const shouldShow = this.get('storageService').getItem(
      StorageUtils.showManagerKey(this.get('authService.authUser'))
    );
    this.set('_shouldShowTaskManager', shouldShow !== StorageUtils.FALSE);
  },
  _setTaskStatus(taskId, status) {
    const task = this.get('tasks').find(task => task && task[TASK_ID_KEY] === taskId);
    if (task) {
      this.get('storageService').setItem(
        StorageUtils.taskKey(this.get('authService.authUser'), taskId),
        status ? StorageUtils.TRUE : StorageUtils.FALSE
      );
      set(task, TASK_STATUS_KEY, status);
    }
  },

  _openSupportSlideout() {
    this.get('slideout/supportService').openSlideout();
    this.get('notifications').clearAll();
  },
});
