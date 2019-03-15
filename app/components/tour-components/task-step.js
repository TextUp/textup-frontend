import Ember from 'ember';
import { PropTypes } from 'ember-prop-types';

const { computed, run, $, tryInvoke } = Ember;

export default Ember.Component.extend({
  propTypes: {
    id: PropTypes.string.isRequired,
    complete: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    completeTask: PropTypes.func.isRequired,
    stepNumber: PropTypes.number.isRequired,
    openBeforePulse: PropTypes.string,
    elementToPulse: PropTypes.string,
    openBeforePulseMobile: PropTypes.string,
    elementToPulseMobile: PropTypes.string
  },

  classNames: ['task-step'],

  _publicAPI: computed(function() {
    return {
      actions: {
        completeTask: this._completeThisTask.bind(this),
        showUserSteps: this._showUserSteps.bind(this)
      }
    };
  }),

  _temporaryComplete: null,

  init() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },

  didReceiveAttrs() {
    this._super(...arguments);
    this.set('_temporaryComplete', this.get('complete'));
  },

  _completeThisTask(taskId, shouldShowCompleteMessage = true) {
    if (taskId === this.get('id') && shouldShowCompleteMessage) {
      this.set('_temporaryComplete', true);
      run.later(() => this.get('completeTask')(taskId), 2000);
    } else {
      this.get('completeTask')(taskId);
    }
  },

  _showUserSteps() {
    // check if element needs to be opened, open if it's visible
    const mobile = $(window).innerWidth() < 750;
    var elementToOpen, elementToPulse;
    if (mobile) {
      elementToOpen = this.get('openBeforePulseMobile');
      elementToPulse = this.get('elementToPulseMobile');
    } else {
      elementToOpen = this.get('openBeforePulse');
      elementToPulse = this.get('elementToPulse');
    }

    if (elementToOpen) {
      const openBeforePulse = $(elementToOpen);
      if (openBeforePulse.is(':visible')) {
        this._pulseElement(elementToOpen);
        run.later(() => openBeforePulse.click(), 2000);
        run.later(() => {
          if (elementToPulse) {
            this._pulseElement(elementToPulse);
          }
        }, 2500);
      }
    } else {
      if (elementToPulse) {
        this._pulseElement(elementToPulse);
      }
    }
  },

  _pulseElement(elementIdToPulse) {
    const elementToPulse = $(elementIdToPulse);
    console.log(elementIdToPulse);
    elementToPulse.addClass('task-element__should-animate-pulse');
    run.later(() => elementToPulse.removeClass('task-element__should-animate-pulse'), 2000);
  }
});
