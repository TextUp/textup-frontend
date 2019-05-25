import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { computed } from '@ember/object';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    src: PropTypes.string.isRequired,
    nativeAppSrc: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    hasCordovaClasses: PropTypes.string,
    noCordovaClasses: PropTypes.string,
  }),
  getDefaultProps() {
    return { hasCordovaClasses: '', noCordovaClasses: '' };
  },

  classNames: ['feedback-switcher'],
  classNameBindings: ['_cordovaClasses'],

  // Internal properties
  // -------------------

  _hasCordova: computed(function() {
    return window.cordova;
  }),

  _cordovaClasses: computed('_hasCordova', 'hasCordovaClasses', 'noCordovaClasses', function() {
    return this.get('_hasCordova') ? this.get('noCordovaClasses') : this.get('hasCordovaClasses');
  }),
});
