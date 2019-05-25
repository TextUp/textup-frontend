import $ from 'jquery';
import Component from '@ember/component';
import HasWormhole from 'textup-frontend/mixins/component/has-wormhole';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { computed } from '@ember/object';
import { scheduleOnce, join } from '@ember/runloop';
import { tryInvoke } from '@ember/utils';

export default Component.extend(PropTypesMixin, HasWormhole, {
  propTypes: Object.freeze({
    doRegister: PropTypes.func,
    elementToHighlight: PropTypes.oneOfType([PropTypes.null, PropTypes.string]),
    showOverlay: PropTypes.bool,
    svgClasses: PropTypes.string,
  }),
  getDefaultProps() {
    return { showOverlay: true };
  },

  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
  },

  // Internal properties
  // -------------------

  _elementDimensions: null,
  _elementToWormhole: computed(function() {
    return this.$();
  }),
  _overlayId: computed(function() {
    return `tour-manager__overlay--${this.elementId}`;
  }),
  _publicAPI: computed(function() {
    return {
      actions: {
        calculateCutout: this._setElementDimensions.bind(this),
        removeCutout: this._removeDimensions.bind(this),
      },
    };
  }),

  // Internal handlers
  // -----------------

  _removeDimensions() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    join(() => this.set('_elementDimensions', null));
  },
  _setElementDimensions() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    join(() => {
      const elementToHighlight = $(this.get('elementToHighlight'))[0];
      if (elementToHighlight) {
        this.set('_elementDimensions', elementToHighlight.getBoundingClientRect());
      }
    });
  },
});
