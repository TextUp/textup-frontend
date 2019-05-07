import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import Staff from 'textup-frontend/models/staff';

// [NOTE] in acceptance tests, we have difficulty setting properties on already-injected services
// so we are unable to set the `authUser` property on `authService` and must allow for the `user`
// prop-type for this component to sometimes be null

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    onLogOut: PropTypes.func.isRequired,
    user: PropTypes.oneOfType([PropTypes.null, PropTypes.instanceOf(Staff)]),
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
