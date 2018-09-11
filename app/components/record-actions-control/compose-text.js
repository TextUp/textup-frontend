import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    hasMedia: PropTypes.bool,
    placeholder: PropTypes.string,
    contents: PropTypes.string,
    onClearContents: PropTypes.func,
    onSend: PropTypes.func,
    onAddImage: PropTypes.func
  },
  getDefaultProps() {
    return { hasMedia: false, placeholder: 'Enter your message...' };
  },
  classNames: ['compose-text'],

  // Internal properties
  // -------------------

  _isInvalid: computed('hasMedia', 'contents', function() {
    return !this.get('hasMedia') && !this.get('contents');
  }),
  _$textarea: computed(function() {
    return this.$('textarea');
  }),

  // Internal handlers
  // -----------------

  _onAddImage() {
    tryInvoke(this, 'onAddImage', [...arguments]);
  },
  _onClearContents() {
    tryInvoke(this, 'onClearContents', [...arguments]);
  },
  _onSend() {
    const textarea = this.get('_$textarea');
    if (textarea) {
      textarea.blur();
    }
    return tryInvoke(this, 'onSend', [...arguments]);
  }
});
