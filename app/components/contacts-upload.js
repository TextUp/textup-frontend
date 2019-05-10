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
    // short circuit on isLoading
    if (this.get('_isLoading')) {
      return;
    }
    this.set('_isError', false);
    if (event.target.files.length > 0) {
      this.set('_isLoading', true);

      VcardUtils.process(event)
        .then(this._onSuccess.bind(this), this._onFailure.bind(this))
        .finally(this._onFinish.bind(this));
    }
  },

  _onSuccess(data) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    tryInvoke(this, 'onImport', [data]);
  },

  _onFailure() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    run(() => this.set('_isError', true));
  },

  _onFinish() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    run(() => this.set('_isLoading', false));
  },
});
