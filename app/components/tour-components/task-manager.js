import Ember from 'ember';
import { PropTypes } from 'ember-prop-types';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend({
  tutorialService: Ember.inject.service(),

  propTypes: {
    doRegister: PropTypes.func,
    firstIncompleteTask: PropTypes.object
  },

  init() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },

  // didInsertElement() {
  // this._resetTasks();
  // this._closeIfAllComplete();
  // },

  classNames: ['task-manager'],

  _publicAPI: computed(function() {
    return {
      actions: {
        finishCompleteTask: this._finishCompleteTask.bind(this),
        resetTasks: this._resetTasks.bind(this),
        closeTaskManager: this._close.bind(this),
        startCompleteTask: this._startCompleteTask.bind(this)
      }
    };
  }),

  _taskStep: null,

  _close() {
    this.destroy();
  },

  _closeIfAllComplete() {
    const firstIncomplete = this.get('firstIncompleteTask');
    if (firstIncomplete === null) {
      this._close();
    }
  },

  _getTaskStatus(taskId) {
    const tutorialService = this.get('tutorialService');
    return tutorialService.getTaskStatus(taskId);
  },

  _startCompleteTask(taskId, shouldShowCompleteMessage) {
    const taskStep = this.get('_taskStep');
    taskStep.actions.completeTask(taskId, shouldShowCompleteMessage);
  },

  _finishCompleteTask(taskId) {
    const tutorialService = this.get('tutorialService');
    tutorialService.finishCompleteTask(taskId);
    // this._closeIfAllComplete();
  },

  _resetTasks() {
    const tutorialService = this.get('tutorialService');
    tutorialService.resetTasks();
  }
});
