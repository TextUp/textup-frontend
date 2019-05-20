import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import FutureMessage from 'textup-frontend/models/future-message';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    message: PropTypes.instanceOf(FutureMessage).isRequired,
  },
});
