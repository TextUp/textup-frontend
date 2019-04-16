import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import * as TourUtil from 'textup-frontend/utils/tour-info';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  authService: Ember.inject.service(),

  // doRegister is a route action
  propTypes: {
    beforeTour: PropTypes.func,
    afterTour: PropTypes.func,
    doRegister: PropTypes.func
  },

  init() {
    this._super(...arguments);
    const tourSteps = TourUtil.getTourSteps();
    this.set('_steps', tourSteps);
    this.set('_numSteps', tourSteps.length);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
    // window.localStorage.setItem(
    //   `tour-manager-${this.get('authService.authUser.username')}-finished-tour`,
    //   false
    // );
  },

  _steps: null,
  _numSteps: null,
  _tourOngoing: false,
  _currentStepNumber: 0,

  // Internal Properties
  // -------------------

  _publicAPI: computed(function() {
    return {
      startTourImmediately: this.get('_startTourImmediately'),
      actions: {
        startTour: this._startTour.bind(this),
        endTour: this._endTour.bind(this),
        nextStep: this._nextStep.bind(this),
        previousStep: this._previousStep.bind(this)
      }
    };
  }),

  // Internal Handlers
  // -----------------

  _startTourImmediately: computed(function() {
    const finishedTour = window.localStorage.getItem(
      `tour-manager-${this.get('authService.authUser.username')}-finished-tour`
    );
    return finishedTour !== 'true';
  }),

  _lastStep: computed('_currentStepNumber', function() {
    const currentStepNumber = this.get('_currentStepNumber');
    const numSteps = this.get('_numSteps');
    return currentStepNumber === numSteps - 1;
  }),

  _firstStep: computed('_currentStepNumber', function() {
    const currentStepNumber = this.get('_currentStepNumber');
    return currentStepNumber === 0;
  }),

  _startTour: function() {
    tryInvoke(this, 'beforeTour');
    this.set('_tourOngoing', true);
  },

  _endTour: function() {
    window.localStorage.setItem(
      `tour-manager-${this.get('authService.authUser.username')}-finished-tour`,
      true
    );
    this.set('_tourOngoing', false);
    tryInvoke(this, 'afterTour');
  },

  _currentStep: computed('_currentStepNumber', function() {
    return this.get('_steps')[this.get('_currentStepNumber')];
  }),

  _nextStep: function() {
    this.incrementProperty('_currentStepNumber');
  },
  _previousStep: function() {
    this.decrementProperty('_currentStepNumber');
  }
});
