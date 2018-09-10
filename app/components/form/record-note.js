import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordNote from 'textup-frontend/models/record-note';

export default Ember.Component.extend(PropTypesMixin, {
  constants: Ember.inject.service(),

  propTypes: {
    recordNote: PropTypes.instanceOf(RecordNote).isRequired,
    doAddImage: PropTypes.func.isRequired,
    doRemoveImage: PropTypes.func.isRequired,
    doAddLocation: PropTypes.func.isRequired,
    doRemoveLocation: PropTypes.func.isRequired,
    onLocationError: PropTypes.func.isRequired,
    contentsClass: PropTypes.string,
    readOnly: PropTypes.bool
  },
  getDefaultProps() {
    return { readOnly: false };
  },
  tagName: 'form'
});
