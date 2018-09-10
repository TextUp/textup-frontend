import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import FutureMessage from 'textup-frontend/models/future-message';

export default Ember.Component.extend(PropTypesMixin, {
  constants: Ember.inject.service(),

  propTypes: {
    futureMessage: PropTypes.instanceOf(FutureMessage).isRequired,
    personalPhoneNumber: PropTypes.oneOfType([PropTypes.null, PropTypes.string])
  }
});
