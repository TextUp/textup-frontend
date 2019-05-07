import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import VcardUtils from 'textup-frontend/utils/vcard';

const { tryInvoke, computed, run } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    onImport: PropTypes.func,
  },

  classNames: ['contacts-upload'],
  classNameBindings: ['_isError:contacts-upload--error'],

  // Internal properties
  // -------------------
  _isError: false,
  _isLoading: false,
  _hasCordova: computed(function() {
    return config.hasCordova;
  }),

  // Internal Handlers
  // -----------------

  _handleChange(event) {
    this.set('_isError', false);
    if (event.target.files.length > 0) {
      this.set('_isLoading', true);

      VcardUtils.process(event)
        .then(
          data => run(() => tryInvoke(this, 'onImport', [data])),
          () => run(() => this.set('_isError', true))
        )
        .finally(() => run(() => this.set('_isLoading', false)));
    }
  },
});
