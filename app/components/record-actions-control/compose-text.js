import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    numMedia: PropTypes.number,
    placeholder: PropTypes.string,
    contents: PropTypes.string,
    onClearContents: PropTypes.func,
    onSend: PropTypes.func,
  },
  getDefaultProps() {
    return { numMedia: 0, placeholder: 'Enter your message...' };
  },
  classNames: ['compose-text'],

  // Internal properties
  // -------------------

  _isInvalid: computed('numMedia', 'contents', function() {
    return !this.get('numMedia') && !this.get('contents');
  }),
  _$textarea: computed(function() {
    return this.$('textarea');
  }),

  // Internal handlers
  // -----------------

  _onClearContents() {
    tryInvoke(this, 'onClearContents', [...arguments]);
  },
  _onSend() {
    const textarea = this.get('_$textarea');
    if (textarea) {
      textarea.blur();
    }
    return tryInvoke(this, 'onSend', [...arguments]);
  },
});
