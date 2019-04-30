import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import StorageUtils from 'textup-frontend/utils/storage';
import TourData from 'textup-frontend/data/tour-data';

const { computed, tryInvoke, run } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    doRegister: PropTypes.func,
    beforeTour: PropTypes.func,
    afterTour: PropTypes.func,
    username: PropTypes.string,
  },

  init() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },

  // Internal properties
  // -------------------

  _steps: TourData,
  _numSteps: TourData.length,
  _tourOngoing: false,
  _currentStepIndex: 0,
  _publicAPI: computed(function() {
    return {
      startTourImmediately: this.get('_startTourImmediately'),
      actions: {
        startTour: this._startTour.bind(this),
        endTour: this._endTour.bind(this),
      },
    };
  }),
  _startTourImmediately: computed('username', function() {
    const finishedTour = window.localStorage.getItem(StorageUtils.tourKey(this.get('username')));
    return finishedTour !== StorageUtils.TRUE;
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
    run.join(() => {
      this.set('_tourOngoing', true);
      tryInvoke(this, 'beforeTour');
    });
  },
  _endTour() {
    run.join(() => {
      window.localStorage.setItem(StorageUtils.tourKey(this.get('username')), StorageUtils.TRUE);
      this.set('_tourOngoing', false);
      tryInvoke(this, 'afterTour');
    });
  },

  _nextStep() {
    this.incrementProperty('_currentStepIndex');
  },
  _previousStep() {
    this.decrementProperty('_currentStepIndex');
  },
});
