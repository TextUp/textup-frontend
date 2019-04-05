import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import Staff from 'textup-frontend/models/staff';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    onClose: PropTypes.func.isRequired,
    onLogOut: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    user: PropTypes.instanceOf(Staff).isRequired,
    activeName: PropTypes.string,
    activeNumber: PropTypes.string,
  },

  tagName: '',
});
