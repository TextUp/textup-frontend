import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    activeOwner: PropTypes.EmberObject.isRequired,
    user: PropTypes.EmberObject.isRequired,
    doLogOut: PropTypes.func.isRequired,

    containerTagName: PropTypes.string,
    doRegisterContainer: PropTypes.func,
    toggleClass: PropTypes.string
  },
  getDefaultProps() {
    return { containerTagName: 'div' };
  },

  classNames: 'textup-account-switcher'
});
