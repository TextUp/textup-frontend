import Ember from 'ember';
import { PropTypes } from 'ember-prop-types';
import HasEvents from 'textup-frontend/mixins/component/has-events';

const { computed, run, $, tryInvoke } = Ember;

export default Ember.Component.extend(HasEvents, {
  propTypes: {
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    completeTask: PropTypes.func.isRequired,
    stepNumber: PropTypes.number.isRequired,
    doRegister: PropTypes.func,
    shouldShow: PropTypes.bool,
    elementsToPulse: PropTypes.arrayOf(PropTypes.string),
    elementsToPulseMobile: PropTypes.arrayOf(PropTypes.string),
  },

  getDefaultProps() {
    return { shouldShow: true };
  },

  classNames: ['task-step'],

  _publicAPI: computed(function() {
    return {
      actions: {
        completeTask: this._completeThisTask.bind(this),
        showUserSteps: this._showUserSteps.bind(this),
        removeAllPulsing: this._removeAllPulsing.bind(this),
      },
    };
  }),

  _temporaryComplete: null,

  init() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },

  didReceiveAttrs({ oldAttrs, newAttrs }) {
    this._super(...arguments);
    this.set('_temporaryComplete', false);

    if (oldAttrs) {
      run.scheduleOnce('afterRender', () => {
        const oldPulsingElements = oldAttrs.elementsToPulse.value;
        const oldPulsingElementsMobile = oldAttrs.elementsToPulseMobile.value;
        if (oldPulsingElements) {
          oldPulsingElements.forEach(element => {
            if (!newAttrs.elementsToPulse.value.includes(element)) {
              this._removePulseFromElement(element);
            }
          });
        }
        if (oldPulsingElementsMobile) {
          oldPulsingElementsMobile.forEach(element => {
            if (!newAttrs.elementsToPulseMobile.value.includes(element)) {
              this._removePulseFromElement(element);
            }
          });
        }
      });
    }

    if (this.get('shouldShow')) {
      run.scheduleOnce('afterRender', this, this._startPulsing);
    }
  },

  _startPulsing() {
    const mobile = $(window).innerWidth() < 750;

    var elementsToPulse, num_elems;

    if (mobile) {
      elementsToPulse = this.get('elementsToPulseMobile');
      num_elems = elementsToPulse.length;
    } else {
      elementsToPulse = this.get('elementsToPulse');
      num_elems = elementsToPulse.length;
    }

    // TODO -> fix this logic to add pulse element to next,
    // if list of elements to pulse is longer than 2, then will fail
    elementsToPulse.forEach((element, index) => {
      if (index < num_elems - 1) {
        this._pulseElement(element);
        $(element).on(this._event('click'), () => {
          run.next(this, this._pulseElement, elementsToPulse[index + 1]);
        });
      } else {
        this._pulseElement(element);
      }
    });
  },

  willDestroyElement() {
    this._removeAllPulsing();
  },

  _completeThisTask(taskId, shouldShowCompleteMessage = true) {
    const mobile = $(window).innerWidth() < 750;
    var elementsToPulse, num_elems;

    if (mobile) {
      elementsToPulse = this.get('elementsToPulseMobile');
      num_elems = elementsToPulse.length;
    } else {
      elementsToPulse = this.get('elementsToPulse');
      num_elems = elementsToPulse.length;
    }

    elementsToPulse.forEach(element => {
      this._removePulseFromElement(element);
    });

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

    var elementsToPulse;

    if (mobile) {
      elementsToPulse = this.get('elementsToPulseMobile');
    } else {
      elementsToPulse = this.get('elementsToPulse');
    }

    elementsToPulse.forEach((element, index) => {
      run.later(() => {
        $(element).click();
      }, 200 + index * 1500);
    });
  },

  _pulseElement(elementIdToPulse) {
    const elementToPulse = $(elementIdToPulse);
    elementToPulse.addClass('task-element__should-animate-pulse');
  },

  _removePulseFromElement(elementIdToRemovePulse) {
    run.scheduleOnce('afterRender', () => {
      const elementToRemove = $(elementIdToRemovePulse);
      elementToRemove.off(this._event('click'));
      elementToRemove.removeClass('task-element__should-animate-pulse');
    });
  },

  _removeAllPulsing() {
    const elements = this.get('elementsToPulse');
    const elementsMobile = this.get('elementsToPulseMobile');

    elements.forEach(element => {
      this._removePulseFromElement(element);
    });
    elementsMobile.forEach(element => {
      this._removePulseFromElement(element);
    });
  },
});
