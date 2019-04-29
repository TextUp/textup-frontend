import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import Staff from 'textup-frontend/models/staff';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    user: PropTypes.instanceOf(Staff).isRequired,
    onLogOut: PropTypes.func.isRequired,
    doRegister: PropTypes.func,
    activeName: PropTypes.string,
    activeNumber: PropTypes.string,
    toggleClass: PropTypes.string,
  },
  getDefaultProps() {
    return { toggleClass: '' };
  },

  classNames: 'textup-account-switcher',
});
