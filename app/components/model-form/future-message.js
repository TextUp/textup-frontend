import Component from '@ember/component';
import FutureMessage from 'textup-frontend/models/future-message';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    onAddImage: PropTypes.func,
    onAddAudio: PropTypes.func,
    onRemoveMedia: PropTypes.func,
    futureMessage: PropTypes.instanceOf(FutureMessage),
    personalNumber: PropTypes.oneOfType([PropTypes.null, PropTypes.string]),
    firstControlClass: PropTypes.string,
  }),

  classNames: 'form',
});
