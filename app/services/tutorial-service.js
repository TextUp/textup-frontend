import Ember from 'ember';
import * as TaskUtil from 'textup-frontend/utils/task-info';

const { computed, set } = Ember;

export default Ember.Service.extend({
  notifications: Ember.inject.service(),
  authService: Ember.inject.service(),

  init() {
    this._super(...arguments);
    const tasks = TaskUtil.getTasks();
    tasks.forEach((task, index) => {
      task.status = this.getTaskStatus(task.id);
      task.stepNumber = index + 1;
    });
    this.set('tasks', tasks);
    const shouldShow = window.localStorage.getItem(
      `task-manager-${this.get('authService.authUser.username')}-shouldShowTaskManager`
    );
    this.set('shouldShowTaskManagerInternal', shouldShow === 'true');
  },

  taskManager: null,

  tasks: null,

  publicAPI: computed('_firstIncompleteTask', '_shouldShowTaskManager', function() {
    return {
      actions: {
        getTaskStatus: this.getTaskStatus.bind(this),
        startCompleteTask: this.startCompleteTask.bind(this),
        finishCompleteTask: this.finishCompleteTask.bind(this),
        closeTaskManager: this.closeTaskManager.bind(this),
        resetTasks: this.resetTasks.bind(this)
      },
      tasks: this.get('tasks'),
      firstIncompleteTask: this.get('_firstIncompleteTask'),
      shouldShowTaskManager: this.get('_shouldShowTaskManager')
    };
  }),

  getTaskStatus(taskId) {
    const status = window.localStorage.getItem(
      `task-manager-${this.get('authService.authUser.username')}-${taskId}`
    );
    return status === 'true';
  },

  _setTaskStatus(taskId, status) {
    const task = this.get('tasks').find(function(task) {
      return task.id === taskId;
    });
    if (task) {
      window.localStorage.setItem(
        `task-manager-${this.get('authService.authUser.username')}-${taskId}`,
        status
      );
      set(task, 'status', status);
    }
  },

  startCompleteTask(taskId) {
    if (taskId === this.get('_firstIncompleteTask').id) {
      this.taskManager.actions.startCompleteTask(taskId);
    }
  },

  finishCompleteTask(taskId) {
    this._setTaskStatus(taskId, true);
  },

  closeTaskManager() {
    this.get('notifications').info(
      'Access the “Getting Started” tour at anytime through <button class="btn-link">the Support menu</button>.',
      {
        htmlContent: true,
        onClick: this._openSupportSlideout.bind(this)
      }
    );
    this.set('shouldShowTaskManagerInternal', false);
    window.localStorage.setItem(
      `task-manager-${this.get('authService.authUser.username')}-shouldShowTaskManager`,
      false
    );
  },
  _openSupportSlideout() {
    Ember.getOwner(this)
      .lookup('route:main')
      .send('startFeedbackSlideout');
  },

  resetTasks() {
    const tasks = this.get('tasks');
    tasks.forEach(task => this._setTaskStatus(task.id, false));
    window.localStorage.setItem(
      `task-manager-${this.get('authService.authUser.username')}-shouldShowTaskManager`,
      true
    );
    this.set('shouldShowTaskManagerInternal', true);
  },

  _firstIncompleteTask: computed('tasks.@each.status', function() {
    const tasks = this.get('tasks');
    const firstIncomplete = tasks.find(function(task) {
      return task.status === false;
    });
    return firstIncomplete;
  }),

  shouldShowTaskManagerInternal: null,

  _shouldShowTaskManager: computed('shouldShowTaskManagerInternal', function() {
    const shouldShow = this.get('shouldShowTaskManagerInternal');
    if (shouldShow === null) {
      return true;
    }
    return shouldShow;
  })
});
