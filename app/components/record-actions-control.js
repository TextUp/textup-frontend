import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { MediaImage } from 'textup-frontend/objects/media-image';

const { computed, run, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    // read-only data attributes passed in
    hasPersonalPhoneNumber: PropTypes.bool,
    hasItemsInRecord: PropTypes.bool,
    images: PropTypes.arrayOf(PropTypes.instanceOf(MediaImage)),
    contents: PropTypes.string,
    // content-related handlers
    onContentChange: PropTypes.func,
    onAddImage: PropTypes.func,
    onRemoveImage: PropTypes.func,
    // record modification handlers
    onAddNoteInPast: PropTypes.func,
    onAddNote: PropTypes.func,
    onCall: PropTypes.func,
    onText: PropTypes.func,
    onScheduleMessage: PropTypes.func
  },
  getDefaultProps() {
    return { images: [], hasPersonalPhoneNumber: false, hasItemsInRecord: false };
  },
  classNames: 'record-actions-control',

  // Internal properties
  // -------------------

  _hasImages: computed.notEmpty('images'),
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

  // Internal handlers
  // -----------------

  // content-related handlers
  _onContentChange(newVal) {
    run.debounce(() => tryInvoke(this, 'onContentChange', [newVal]), 500);
  },
  _onAddImage() {
    tryInvoke(this, 'onAddImage', [...arguments]);
  },
  _onRemoveImage() {
    tryInvoke(this, 'onRemoveImage', [...arguments]);
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
    tryInvoke(this, 'onText', [this.get('contents'), this.get('images')]);
  },
  _scheduleMessage() {
    tryInvoke(this, 'onScheduleMessage');
  }
});
