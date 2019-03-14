import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import FutureMessage from 'textup-frontend/models/future-message';

const { tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    futureMessage: PropTypes.instanceOf(FutureMessage).isRequired,
    personalNumber: PropTypes.oneOfType([PropTypes.null, PropTypes.string]),
    onAddImage: PropTypes.func,
    onAddAudio: PropTypes.func,
    onRemoveMedia: PropTypes.func,
  },

  classNames: 'form',

  // Internal handlers
  // -----------------

  _onAddImage() {
    return tryInvoke(this, 'onAddImage', [...arguments]);
  },
  _onAddAudio() {
    return tryInvoke(this, 'onAddAudio', [...arguments]);
  },
  _onRemoveMedia() {
    return tryInvoke(this, 'onRemoveMedia', [...arguments]);
  },
});
