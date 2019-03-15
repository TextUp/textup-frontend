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

  taskManager: null, // TODO

  tasks: null,

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

  resetTasks() {
    const tasks = this.get('tasks');
    tasks.forEach(task => this._setTaskStatus(task.id, false));
  },

  firstIncompleteTask: computed('tasks.@each.status', function() {
    const tasks = this.get('tasks');
    const firstIncomplete = tasks.find(function(task) {
      return task.status === false;
    });
    if (firstIncomplete) {
      return firstIncomplete;
    }
    return null;
  })
});
