import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import HasWormhole from 'textup-frontend/mixins/component/has-wormhole';

const { computed, $, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, HasWormhole, {
  propTypes: {
    elementToHighlight: PropTypes.string,
    showOverlay: PropTypes.bool,
    doRegister: PropTypes.func,
    svgClasses: PropTypes.string
  },

  getDefaultProps() {
    return {
      showOverlay: true
    };
  },

  init() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },

  _publicAPI: computed(function() {
    return {
      actions: {
        calculateCutout: this._setElementDimensions.bind(this),
        removeCutout: this._removeDimensions.bind(this)
      }
    };
  }),

  _elementDimensions: null,
  _elementToWormhole: computed('_svgId', function() {
    return this.$('#' + this.get('_svgId'));
  }),

  _svgId: computed(function() {
    return `tour-manager--${this.elementId}`;
  }),

  _removeDimensions() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this.set('_elementDimensions', null);
  },

  _setElementDimensions() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    const elementToHighlight = $(this.get('elementToHighlight'))[0];
    if (elementToHighlight) {
      const dimensions = elementToHighlight.getBoundingClientRect();
      this.set('_elementDimensions', {
        x: dimensions.x,
        y: dimensions.y,
        width: dimensions.width,
        height: dimensions.height
      });
    }
  }
});
