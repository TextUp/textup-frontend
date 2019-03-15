import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    hintTitle: PropTypes.string.isRequired,
    hintText: PropTypes.string.isRequired,
    closeWindowFunction: PropTypes.func.isRequired,
    closeButton: PropTypes.bool,
    closeButtonText: PropTypes.string
  },
  getDefaultProps() {
    return {
      closeButton: true,
      closeButtonText: 'Got it!'
    };
  },
  closeWindow: function() {
    this.get('closeWindowFunction')();
  }
});
