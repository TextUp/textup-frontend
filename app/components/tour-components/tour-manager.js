import Component from '@ember/component';
import { computed } from '@ember/object';
import { tryInvoke } from '@ember/utils';
import { run } from '@ember/runloop';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import TourData from 'textup-frontend/data/tour-data';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    doRegister: PropTypes.func,
    onTourFinish: PropTypes.func,
  },

  init() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
  },

  // Internal properties
  // -------------------

  _steps: TourData,
  _numSteps: TourData.length,
  _tourOngoing: false,
  _currentStepIndex: 0,
  _publicAPI: computed(function() {
    return {
      isOngoing: false,
      actions: {
        startTour: this._startTour.bind(this),
        endTour: this._endTour.bind(this),
      },
    };
  }),
  _firstStep: computed('_currentStepIndex', function() {
    return this.get('_currentStepIndex') === 0;
  }),
  _lastStep: computed('_currentStepIndex', '_numSteps', function() {
    return this.get('_currentStepIndex') === this.get('_numSteps') - 1;
  }),
  _currentStep: computed('_currentStepIndex', '_steps.[]', function() {
    return this.get('_steps')[this.get('_currentStepIndex')];
  }),

  // Internal handlers
  // -----------------

  _startTour() {
    this._setTourOngoing(true);
  },
  _endTour() {
    this._setTourOngoing(false);
    tryInvoke(this, 'onTourFinish');
  },
  _setTourOngoing(isOngoing) {
    run.join(() =>
      this.setProperties({ _tourOngoing: isOngoing, '_publicAPI.isOngoing': isOngoing })
    );
  },

  _nextStep() {
    this.incrementProperty('_currentStepIndex');
  },
  _previousStep() {
    this.decrementProperty('_currentStepIndex');
  },
});
