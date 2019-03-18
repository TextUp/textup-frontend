import Ember from 'ember';
import { PropTypes } from 'ember-prop-types';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend({
  tutorialService: Ember.inject.service(),

  propTypes: {
    doRegister: PropTypes.func,
    firstIncompleteTask: PropTypes.object,
    onClose: PropTypes.func,
    getTaskStatus: PropTypes.func,
    onFinishCompleteTask: PropTypes.func,
    resetTasks: PropTypes.func
  },

  init() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },

  classNames: ['task-manager'],

  _publicAPI: computed(function() {
    return {
      actions: {
        finishCompleteTask: this._finishCompleteTask.bind(this),
        resetTasks: this._resetTasks.bind(this),
        startCompleteTask: this._startCompleteTask.bind(this)
      }
    };
  }),

  _taskStep: null,

  _onClose() {
    tryInvoke(this, 'onClose');
  },

  _getTaskStatus(taskId) {
    return tryInvoke(this, 'getTaskStatus', [taskId]);
  },

  _startCompleteTask(taskId, shouldShowCompleteMessage) {
    const taskStep = this.get('_taskStep');
    taskStep.actions.completeTask(taskId, shouldShowCompleteMessage);
  },

  _finishCompleteTask(taskId) {
    tryInvoke(this, 'onFinishCompleteTask', [taskId]);
  },

  _resetTasks() {
    tryInvoke(this, 'resetTasks');
  }
});
