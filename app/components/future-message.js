import Component from '@ember/component';
import FutureMessage from 'textup-frontend/models/future-message';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    message: PropTypes.instanceOf(FutureMessage).isRequired,
  }),
});
