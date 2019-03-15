import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import callIfPresent from 'textup-frontend/utils/call-if-present';

const { computed, tryInvoke, RSVP } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  tour: Ember.inject.service(),

  // doRegister is a route action
  propTypes: {
    beforeTour: PropTypes.func,
    afterTour: PropTypes.func,
    doRegister: PropTypes.func,
    startTourImmediately: PropTypes.bool
  },
  getDefaultProps() {
    return {
      startTourImmediately: false
    };
  },

  init() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },

  didInsertElement() {
    this._sortSteps();
    const tourSteps = this._generateTourSteps();
    this._generateTour(tourSteps);

    this.get('tour')
      .on('complete', this._endTour.bind(this))
      .on('cancel', this._endTour.bind(this));
  },

  // Internal Properties
  // -------------------

  _publicAPI: computed(function() {
    return {
      startTourImmediately: this.get('startTourImmediately'),
      actions: {
        addStep: this._addStep.bind(this),
        startTour: this._startTour.bind(this)
      }
    };
  }),

  // Internal Handlers
  // -----------------

  _startTour: function() {
    Ember.$(Ember.getOwner(this).rootElement).addClass('tour-managed');
    tryInvoke(this, 'beforeTour');
    this.get('tour').start();
  },
  _endTour: function() {
    Ember.$(Ember.getOwner(this).rootElement).removeClass('tour-managed');
    tryInvoke(this, 'afterTour');
  },
  _steps: computed(function() {
    return [];
  }),
  _addStep: function(step) {
    this.get('_steps').pushObject(step);
  },
  _generateButtons: function(stepNumber, numSteps) {
    const buttons = [
      {
        classes: 'shepherd-button-secondary',
        text: 'Exit',
        type: 'cancel'
      }
    ];
    if (stepNumber > 0) {
      buttons.pushObject({
        classes: 'shepherd-button-primary',
        text: 'Back',
        type: 'back'
      });
    }
    if (stepNumber < numSteps - 1) {
      buttons.pushObject({
        classes: 'shepherd-button-primary',
        text: 'Next',
        type: 'next'
      });
    }
    return buttons;
  },
  _sortSteps: function() {
    this.get('_steps').sort(function(a, b) {
      return a.stepNumber - b.stepNumber;
    });
  },
  /*
  Iterate through all the steps and create a json object used to create
  ember shepherd tour.
  Info needed:
  - id: id of step
  - stepNumber: position of step in tour (to sort list)
  - elementToAttachTo: element to attach to (empty div with same id of step)
  - beforeShow: function to be called when step is shown (navigate to appropriate region)
  - title: title of step to be displayed on card
  - text: text of step to be displayed on card
  */
  _generateTourSteps: function() {
    const numSteps = this.get('_steps').length;
    const toReturn = [];
    const callStepAfterShow = this.get('_callStepAfterShow');

    this.get('_steps').forEach((step, index) => {
      const toPush = {
        id: step.id,
        options: {
          attachTo: step.actions.hasBlock() ? step.elementToAttachTo : '',
          beforeShowPromise: function() {
            return new RSVP.Promise(function(resolve) {
              Ember.run.scheduleOnce('afterRender', function() {
                tryInvoke(step, 'beforeShow');
                resolve();
              });
            });
          },
          builtInButtons: this._generateButtons(index, numSteps),
          title: step.title,
          text: [step.text],
          when: {
            hide: function() {
              Ember.run.throttle(callStepAfterShow, step.afterShow, 100);
            }
          }
        }
      };

      toReturn.pushObject(toPush);
    });
    return toReturn;
  },

  _callStepAfterShow(afterShow) {
    callIfPresent(null, afterShow);
  },

  _generateTour: function(tourSteps) {
    this.get('tour').set('defaults', {
      classes:
        'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text shepherd-mobile-tour',
      copyStyles: false,
      highlightClass: 'selected-tour-element',
      scrollTo: true,
      showCancelLink: true
    });
    this.get('tour').set('modal', true);
    this.get('tour').set('disableScroll', true);
    this.get('tour').set('steps', tourSteps);
  }
});
