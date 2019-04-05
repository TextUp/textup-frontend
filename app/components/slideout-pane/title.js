import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
  },

  classNames: 'slideout-pane__header flex',
});
