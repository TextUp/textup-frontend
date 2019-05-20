import { empty } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { tryInvoke } from '@ember/utils';
import { run } from '@ember/runloop';
import MediaElement from 'textup-frontend/models/media-element';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { isRecordingSupported } from 'textup-frontend/utils/audio';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    audio: PropTypes.oneOfType([
      PropTypes.null,
      PropTypes.arrayOf(PropTypes.instanceOf(MediaElement)),
    ]),
    listProps: PropTypes.oneOfType([PropTypes.null, PropTypes.object]),
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    readOnly: PropTypes.bool,
    showAddIfNone: PropTypes.bool,
    startAddMessage: PropTypes.string,
    cancelAddMessage: PropTypes.string,
  },
  getDefaultProps() {
    return {
      audio: [],
      readOnly: false,
      showAddIfNone: false,
      startAddMessage: 'Add recording',
      cancelAddMessage: 'Cancel add recording',
    };
  },
  classNames: 'audio-wrapper',

  didReceiveAttrs() {
    this._super(...arguments);
    if (this.get('_openIfNoAudio')) {
      // the hide-show is not immediately registered to prevent any double-render errors
      run.next(this, this._startAdding);
    }
  },

  // Internal properties
  // -------------------

  _addHideShow: null,
  _showAdd: computed('readOnly', 'onAdd', '_openIfNoAudio', function() {
    return (
      !this.get('readOnly') &&
      !this.get('_openIfNoAudio') &&
      this.get('onAdd') &&
      isRecordingSupported()
    );
  }),
  _showRemove: computed('readOnly', 'onRemove', function() {
    return !this.get('readOnly') && this.get('onRemove');
  }),
  _noAudio: empty('audio'),
  _openIfNoAudio: computed('_noAudio', 'showAddIfNone', function() {
    return this.get('_noAudio') && this.get('showAddIfNone');
  }),

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
  },
});
