import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
const { computed, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    doRegister: PropTypes.func,
    _numTotal: PropTypes.number,
    _isLoading: false,
  },

  classNames: 'contacts-load',

  didInitAttrs() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },

  // Internal properties
  // -------------------

  _publicAPI: computed(function() {
    return {
      isLoading: false,
      actions: {
        // _addToQueue: this._select.bind(this),
      },
    };
  }),

  _updateIsLoading(status) {
    this.setProperties({
      _isLoading: status,
      '_publicAPI.isLoading': status,
    });
  },

  _addToQueue() {},
});
