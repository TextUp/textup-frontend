import Component from '@ember/component';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';
import { tryInvoke } from '@ember/utils';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    shouldShow: PropTypes.bool,
    doRegister: PropTypes.func,
    firstIncompleteTask: PropTypes.object,
    onClose: PropTypes.func,
    onFinishCompleteTask: PropTypes.func,
    resetTasks: PropTypes.func,
    tasks: PropTypes.arrayOf(PropTypes.object),
  },
  getDefaultProps() {
    return { shouldShow: true };
  },

  init() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
  },

  classNames: 'task-manager',
  classNameBindings: 'shouldShow::task-manager--hidden',

  // Internal properties
  // -------------------

  _taskStep: null,
  _publicAPI: computed(function() {
    return {
      actions: {
        finishCompleteTask: this._finishCompleteTask.bind(this),
        resetTasks: this._resetTasks.bind(this),
        startCompleteTask: this._startCompleteTask.bind(this),
      },
    };
  }),

  // Internal handlers
  // -----------------

  _onClose() {
    const taskStep = this.get('_taskStep');
    if (taskStep) {
      taskStep.actions.removeAllPulsing();
    }
    tryInvoke(this, 'onClose');
  },
  _startCompleteTask(taskId, shouldShowCompleteMessage) {
    const taskStep = this.get('_taskStep');
    if (taskStep) {
      taskStep.actions.completeTask(taskId, shouldShowCompleteMessage);
    }
  },
  _finishCompleteTask(taskId) {
    tryInvoke(this, 'onFinishCompleteTask', [taskId]);
  },
  _resetTasks() {
    tryInvoke(this, 'resetTasks');
  },
});
