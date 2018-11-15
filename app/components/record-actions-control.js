import Ember from 'ember';
import MediaElement from 'textup-frontend/models/media-element';
import MutationObserver from 'npm:mutation-observer';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, tryInvoke, run } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    // read-only data attributes passed in
    hasPersonalPhoneNumber: PropTypes.bool,
    hasItemsInRecord: PropTypes.bool,
    images: PropTypes.arrayOf(PropTypes.instanceOf(MediaElement)),
    audio: PropTypes.arrayOf(PropTypes.instanceOf(MediaElement)),
    contents: PropTypes.string,
    // other handlers
    onHeightChange: PropTypes.func,
    // content-related handlers
    onContentChange: PropTypes.func,
    onAddImage: PropTypes.func,
    onAddAudio: PropTypes.func,
    onRemoveMedia: PropTypes.func,
    // record modification handlers
    onAddNoteInPast: PropTypes.func,
    onAddNote: PropTypes.func,
    onCall: PropTypes.func,
    onText: PropTypes.func,
    onScheduleMessage: PropTypes.func
  },
  getDefaultProps() {
    return { audio: [], images: [], hasPersonalPhoneNumber: false, hasItemsInRecord: false };
  },
  classNames: 'record-actions-control',

  didInsertElement() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', this, this._attachListeners);
    run.scheduleOnce('afterRender', this, this._storeInitialHeight);
  },
  willDestroyElement() {
    this._super(...arguments);
    this._removeListeners();
  },

  // Internal properties
  // -------------------

  _mutationObserver: null,
  _mediaDrawer: null,
  _numMedia: computed('images.[]', 'audio.[]', function() {
    return (this.get('images.length') || 0) + (this.get('audio.length') || 0);
  }),
  // [FUTURE] we haven't written a new textarea component that respects DDAU so we're artificially
  // creating DDAU in this component until we rewrite the textarea component
  _contents: computed('contents', {
    get() {
      return this.get('contents');
    },
    set(key, value) {
      this._onContentChange(value);
      return value;
    }
  }),
  _previousHeight: null,

  // Internal handlers
  // -----------------

  _attachListeners() {
    const observer = new MutationObserver(this._notifyMutation.bind(this));
    observer.observe(this.element, { childList: true, subtree: true });
    this.set('_mutationObserver', observer);
  },
  _removeListeners() {
    const observer = this.get('_mutationObserver');
    if (observer) {
      observer.disconnect();
      this.set('_mutationObserver', null);
    }
  },

  _storeInitialHeight() {
    this.set('_previousHeight', this.$().innerHeight());
  },
  _notifyMutation() {
    run.debounce(this, this._onHeightChange, 500);
  },
  _onHeightChange() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    const prevHeight = this.get('_previousHeight'),
      currHeight = this.$().innerHeight();
    if (!prevHeight || currHeight !== prevHeight) {
      tryInvoke(this, 'onHeightChange', [currHeight]);
    }
    this.set('_previousHeight', currHeight);
  },

  // content-related handlers
  _onContentChange(newVal) {
    tryInvoke(this, 'onContentChange', [newVal]); // do NOT debounce or else typing will be very laggy
  },
  _onAddImage() {
    tryInvoke(this, 'onAddImage', [...arguments]);
  },
  _onStartAddAudio() {
    const drawer = this.get('_mediaDrawer');
    if (drawer && drawer.actions) {
      tryInvoke(drawer.actions, 'startAddAudio');
    }
  },
  _onAddAudio() {
    tryInvoke(this, 'onAddAudio', [...arguments]);
  },
  _onRemoveMedia() {
    tryInvoke(this, 'onRemoveMedia', [...arguments]);
  },

  // record modification handlers
  _addNoteInPast() {
    tryInvoke(this, 'onAddNoteInPast');
  },
  _addNoteNow() {
    tryInvoke(this, 'onAddNote');
  },
  _startCall() {
    tryInvoke(this, 'onCall');
  },
  _onSendText() {
    return tryInvoke(this, 'onText', [this.get('contents'), this.get('images')]);
  },
  _scheduleMessage() {
    tryInvoke(this, 'onScheduleMessage');
  }
});
