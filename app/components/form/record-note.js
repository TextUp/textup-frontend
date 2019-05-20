import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordNote from 'textup-frontend/models/record-note';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    recordNote: PropTypes.instanceOf(RecordNote).isRequired,
    onAddImage: PropTypes.func.isRequired,
    onAddAudio: PropTypes.func.isRequired,
    onRemoveMedia: PropTypes.func.isRequired,
    onAddLocation: PropTypes.func.isRequired,
    onRemoveLocation: PropTypes.func.isRequired,
    onLocationError: PropTypes.func.isRequired,
    contentsClass: PropTypes.string,
    readOnly: PropTypes.bool,
  },
  getDefaultProps() {
    return { readOnly: false };
  },
  tagName: 'form',
  classNames: 'form',
});
