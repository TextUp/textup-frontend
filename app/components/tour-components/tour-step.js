import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import * as TourUtil from 'textup-frontend/utils/tour-info';

const { computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    stepId: PropTypes.string.isRequired,
    registerWithTourManager: PropTypes.func.isRequired,
    beforeShow: PropTypes.func,
    afterShow: PropTypes.func
  },
  getDefaultProps() {
    return {
      afterShow: function() {
        console.log('after show');
      }
    };
  },
  tagName: '',

  init() {
    this._super(...arguments);
    this.get('registerWithTourManager')(this.get('_publicAPI'));
  },

  // Internal properties
  // -----------------

  _publicAPI: computed(function() {
    return {
      id: this.get('stepId'),
      stepNumber: this.get('_stepNumber'),
      beforeShow: this.get('beforeShow'),
      afterShow: this.get('afterShow'),
      title: this.get('_title'),
      text: this.get('_text'),
      elementToAttachTo: {
        element: this.get('_elementToAttachTo'),
        on: 'bottom'
      },
      actions: {
        hasBlock: this._hasBlock.bind(this)
      }
    };
  }),

  _title: computed('stepId', function() {
    const stepId = this.get('stepId');
    return TourUtil.getTitle(stepId);
  }),
  _text: computed('stepId', function() {
    const stepId = this.get('stepId');
    return TourUtil.getText(stepId);
  }),
  _stepNumber: computed('stepId', function() {
    const stepId = this.get('stepId');
    return TourUtil.getStepNumber(stepId);
  }),
  _elementToAttachTo: computed('_containerId', function() {
    return `#${this.get('_containerId')}`;
  }),
  _containerId: computed('elementId', function() {
    return `${this.get('elementId')}__container`;
  }),

  // Internal handlers
  // -----------------

  _hasBlock() {
    return !!Ember.$(this.get('_elementToAttachTo')).length;
  }
});
