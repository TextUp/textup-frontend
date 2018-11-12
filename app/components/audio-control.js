import Ember from 'ember';
import MediaElement from 'textup-frontend/models/media-element';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { isRecordingSupported } from 'textup-frontend/utils/audio';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    audio: PropTypes.oneOfType([
      PropTypes.null,
      PropTypes.arrayOf(PropTypes.instanceOf(MediaElement))
    ]),
    listProps: PropTypes.oneOfType([PropTypes.null, PropTypes.object]),
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    readOnly: PropTypes.bool,
    startAddMessage: PropTypes.string,
    cancelAddMessage: PropTypes.string
  },
  getDefaultProps() {
    return {
      audio: [],
      readOnly: false,
      startAddMessage: 'Add recording',
      cancelAddMessage: 'Cancel add recording'
    };
  },
  classNames: 'audio-wrapper',

  // Internal properties
  // -------------------

  _showAdd: computed('readOnly', 'onAdd', function() {
    return !this.get('readOnly') && this.get('onAdd') && isRecordingSupported();
  }),
  _showRemove: computed('readOnly', 'onRemove', function() {
    return !this.get('readOnly') && this.get('onRemove');
  }),

  // Internal handlers
  // -----------------

  _onAdd() {
    tryInvoke(this, 'onAdd', [...arguments]);
  },
  _onRemove() {
    tryInvoke(this, 'onRemove', [...arguments]);
  }
});
