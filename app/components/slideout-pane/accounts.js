import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    doClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    activeOwner: PropTypes.EmberObject.isRequired,
    user: PropTypes.EmberObject.isRequired,
    doLogOut: PropTypes.func.isRequired,
  },

  tagName: '',
});
