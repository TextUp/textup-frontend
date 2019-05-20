import $ from 'jquery';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { tryInvoke } from '@ember/utils';
import { run } from '@ember/runloop';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import HasWormhole from 'textup-frontend/mixins/component/has-wormhole';

export default Component.extend(PropTypesMixin, HasWormhole, {
  propTypes: {
    doRegister: PropTypes.func,
    elementToHighlight: PropTypes.oneOfType([PropTypes.null, PropTypes.string]),
    showOverlay: PropTypes.bool,
    svgClasses: PropTypes.string,
  },
  getDefaultProps() {
    return { showOverlay: true };
  },

  init() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
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
    run.join(() => this.set('_elementDimensions', null));
  },
  _setElementDimensions() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    run.join(() => {
      const elementToHighlight = $(this.get('elementToHighlight'))[0];
      if (elementToHighlight) {
        this.set('_elementDimensions', elementToHighlight.getBoundingClientRect());
      }
    });
  },
});
