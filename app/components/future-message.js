import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import FutureMessage from 'textup-frontend/models/future-message';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    message: PropTypes.instanceOf(FutureMessage).isRequired,
  },
});
