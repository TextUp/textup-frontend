import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    recordNote: PropTypes.EmberObject.isRequired,
    doAddPhoto: PropTypes.func.isRequired,
    doRemovePhoto: PropTypes.func.isRequired,
    doAddLocation: PropTypes.func.isRequired,
    doRemoveLocation: PropTypes.func.isRequired,
    onLocationError: PropTypes.func.isRequired,
    contentsClass: PropTypes.string,
    readOnly: PropTypes.boolean
  },
  getDefaultProps() {
    return { readOnly: false };
  },

  tagName: 'form'
});
