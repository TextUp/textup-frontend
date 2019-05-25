import $ from 'jquery';
import ArrayUtils from 'textup-frontend/utils/array';
import Component from '@ember/component';
import HasAppRoot from 'textup-frontend/mixins/component/has-app-root';
import HasEvents from 'textup-frontend/mixins/component/has-events';
import PlatformUtils from 'textup-frontend/utils/platform';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { computed } from '@ember/object';
import { join, scheduleOnce, next, later, debounce } from '@ember/runloop';
import { tryInvoke } from '@ember/utils';

export const PULSING_CLASS = 'task-element__should-animate-pulse';
export const TEMPORARY_COMPLETE_SHOW_DURATION_IN_MS = 2000;
export const SHOW_ME_START_DELAY_IN_MS = 200;
export const SHOW_ME_BETWEEN_STEPS_DELAY_IN_MS = 1500;

export default Component.extend(PropTypesMixin, HasEvents, HasAppRoot, {
  propTypes: Object.freeze({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    completeTask: PropTypes.func.isRequired,
    stepNumber: PropTypes.number.isRequired,
    doRegister: PropTypes.func,
    shouldShow: PropTypes.bool,
    elementsToPulse: PropTypes.arrayOf(PropTypes.string),
    elementsToPulseMobile: PropTypes.arrayOf(PropTypes.string),
  }),
  getDefaultProps() {
    return { shouldShow: true };
  },

  classNames: 'task-step',

  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
  },
  didReceiveAttrs() {
    this._super(...arguments);
    this.set('_temporaryComplete', false);
    this._cleanupPulses();
    if (this.get('shouldShow')) {
      next(this, this._startPulsing);
    }
  },
  willDestroyElement() {
    this._super(...arguments);
    this._removeAllCurrentPulsing();
  },

  // Internal properties
  // -------------------

  _oldElementsToPulse: null,
  _oldElementsToPulseMobile: null,
  _temporaryComplete: null,
  _publicAPI: computed(function() {
    return {
      actions: {
        completeTask: this._completeThisTask.bind(this),
        showUserSteps: this._debounceShowUserSteps.bind(this),
        removeAllPulsing: this._removeAllCurrentPulsing.bind(this),
      },
    };
  }),

  // Internal handlers
  // -----------------

  _completeThisTask(taskId, shouldShowCompleteMessage = true) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this._removeAllCurrentPulsing();
    if (taskId === this.get('id') && shouldShowCompleteMessage) {
      this.set('_temporaryComplete', true);
      later(this, this.get('completeTask'), taskId, TEMPORARY_COMPLETE_SHOW_DURATION_IN_MS);
    } else {
      this.get('completeTask')(taskId);
    }
  },
  _debounceShowUserSteps() {
    debounce(this, this._showUserSteps, 1000, true);
  },
  _showUserSteps() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this._getCurrentElementSelectors().forEach((elementSelector, index) => {
      later(
        () => $(elementSelector).click(),
        SHOW_ME_START_DELAY_IN_MS + index * SHOW_ME_BETWEEN_STEPS_DELAY_IN_MS
      );
    });
  },
  _getCurrentElementSelectors() {
    return ArrayUtils.ensureArrayAndAllDefined(
      PlatformUtils.isMobile() ? this.get('elementsToPulseMobile') : this.get('elementsToPulse')
    );
  },

  _cleanupPulses() {
    const oldElementsToPulse = this.get('_oldElementsToPulse'),
      oldElementsToPulseMobile = this.get('_oldElementsToPulseMobile');
    if (oldElementsToPulse) {
      this._removeAllPulsingFromList(oldElementsToPulse);
    }
    if (oldElementsToPulseMobile) {
      this._removeAllPulsingFromList(oldElementsToPulseMobile);
    }
    this.setProperties({
      _oldElementsToPulse: this.get('elementsToPulse'),
      _oldElementsToPulseMobile: this.get('elementsToPulseMobile'),
    });
  },
  _startPulsing() {
    const $root = this.get('_root'),
      elementsToPulse = this._getCurrentElementSelectors(),
      numElems = elementsToPulse.length;
    elementsToPulse.forEach((elementSelector, index) => {
      this._pulseElement(elementSelector);
      if (index < numElems - 1) {
        $root.on(
          this._event('click'),
          elementSelector,
          this._pulseElementAfterDelay.bind(this, elementsToPulse[index + 1])
        );
      }
    });
  },
  _pulseElementAfterDelay(elementSelector) {
    next(this, this._pulseElement, elementSelector);
  },
  _pulseElement(elementSelector) {
    $(elementSelector).addClass(PULSING_CLASS);
  },
  _removeAllCurrentPulsing() {
    // Do not include `isDestroying` because that is true when `willDestroyElement` hook is called
    if (this.get('isDestroyed')) {
      return;
    }
    this.get('_root').off(this._event('click'));
    this._removeAllPulsingFromList(this.get('elementsToPulse'));
    this._removeAllPulsingFromList(this.get('elementsToPulseMobile'));
  },
  _removePulseFromElement(elementSelector) {
    join(() => {
      scheduleOnce('afterRender', () => {
        this.get('_root').off(this._event('click'), elementSelector);
        $(elementSelector).removeClass(PULSING_CLASS);
      });
    });
  },
  _removeAllPulsingFromList(list) {
    ArrayUtils.ensureArrayAndAllDefined(list).forEach(elementSelector =>
      this._removePulseFromElement(elementSelector)
    );
  },
});
