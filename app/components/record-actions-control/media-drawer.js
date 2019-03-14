import Ember from 'ember';
import MediaElement from 'textup-frontend/models/media-element';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    audio: PropTypes.arrayOf(PropTypes.instanceOf(MediaElement)),
    images: PropTypes.arrayOf(PropTypes.instanceOf(MediaElement)),
    doRegister: PropTypes.func,
    onAddAudio: PropTypes.func,
    onRemoveMedia: PropTypes.func,
  },

  didInitAttrs() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },

  // Internal properties
  // -------------------

  _shouldShowDrawer: computed('images.[]', 'audio.[]', '_isAddingAudio', function() {
    return (
      this.get('_isAddingAudio') || this.get('images.length') > 0 || this.get('audio.length') > 0
    );
  }),
  _publicAPI: computed(function() {
    return { actions: { startAddAudio: () => this._startAddAudio() } };
  }),
  _isAddingAudio: false,

  // Internal handlers
  // -----------------

  _startAddAudio() {
    this.set('_isAddingAudio', true);
  },
  _finishAddingAudio() {
    tryInvoke(this, 'onAddAudio', [...arguments]);
    this.set('_isAddingAudio', false);
  },

  // no matter audio or image, always passed element then index
  _onRemoveMedia() {
    tryInvoke(this, 'onRemoveMedia', [...arguments]);
  },
});
