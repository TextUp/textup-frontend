import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    doRegister: PropTypes.func
  },

  didInitAttrs() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },

  // Internal properties
  // -------------------

  _publicAPI: computed(function() {
    return {
      isOpen: false,
      actions: {
        toggle: () => this._toggle(),
        open: () => this._open(),
        close: () => this._close()
      }
    };
  }),

  // Internal handlers
  // -----------------

  _toggle() {
    this.toggleProperty('_publicAPI.isOpen');
  },
  _open() {
    this.set('_publicAPI.isOpen', true);
  },
  _close() {
    this.set('_publicAPI.isOpen', false);
  }
});
