import Ember from 'ember';
import MediaElement from 'textup-frontend/models/media-element';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { isRecordingSupported } from 'textup-frontend/utils/audio';

const { computed, tryInvoke, run } = Ember;

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

  didReceiveAttrs() {
    this._super(...arguments);
    if (this.get('_noAudio')) {
      run.scheduleOnce('afterRender', this, this._startAdding);
    }
  },

  // Internal properties
  // -------------------

  _addHideShow: null,
  _showAdd: computed('readOnly', 'onAdd', '_noAudio', function() {
    return (
      !this.get('readOnly') && !this.get('_noAudio') && this.get('onAdd') && isRecordingSupported()
    );
  }),
  _showRemove: computed('readOnly', 'onRemove', function() {
    return !this.get('readOnly') && this.get('onRemove');
  }),
  _noAudio: computed.empty('audio'),

  // Internal handlers
  // -----------------

  _startAdding() {
    const hideShow = this.get('_addHideShow');
    if (hideShow) {
      hideShow.actions.open();
    }
  },
  _onAdd() {
    tryInvoke(this, 'onAdd', [...arguments]);
  },
  _onRemove() {
    tryInvoke(this, 'onRemove', [...arguments]);
  }
});
