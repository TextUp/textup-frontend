import Ember from 'ember';
import * as TaskUtil from 'textup-frontend/utils/task-info';

const { computed, set } = Ember;

export default Ember.Service.extend({
  init() {
    this._super(...arguments);
    const tasks = TaskUtil.getTasks();
    tasks.forEach((task, index) => {
      task.status = this.getTaskStatus(task.id);
      task.stepNumber = index + 1;
    });
    this.set('tasks', tasks);
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
      firstIncompleteTask: this.get('_firstIncompleteTask'),
      shouldShowTaskManager: this.get('_shouldShowTaskManager')
    };
  }),

  getTaskStatus(taskId) {
    const status = window.localStorage.getItem(`task-manager-${taskId}`);
    return status === 'true';
  },

  _setTaskStatus(taskId, status) {
    const task = this.get('tasks').find(function(task) {
      return task.id === taskId;
    });
    if (task) {
      window.localStorage.setItem(`task-manager-${taskId}`, status);
      set(task, 'status', status);
    }
  },

  startCompleteTask(taskId) {
    this.taskManager.actions.startCompleteTask(taskId);
  },

  finishCompleteTask(taskId) {
    this._setTaskStatus(taskId, true);
  },

  closeTaskManager() {
    console.log('in tutorial service this', this);
    const tasks = this.get('tasks');
    tasks.forEach(task => this._setTaskStatus(task.id, true));
  },

  resetTasks() {
    const tasks = this.get('tasks');
    tasks.forEach(task => this._setTaskStatus(task.id, false));
  },

  _firstIncompleteTask: computed('tasks.@each.status', function() {
    const tasks = this.get('tasks');
    const firstIncomplete = tasks.find(function(task) {
      return task.status === false;
    });
    return firstIncomplete;
  }),

  _shouldShowTaskManager: computed('_firstIncompleteTask', function() {
    return this.get('_firstIncompleteTask') !== undefined;
  })
});
