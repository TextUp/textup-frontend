import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import VcardUtils from 'textup-frontend/utils/vcard';
import { ContactObject } from 'textup-frontend/objects/contact-object';

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
  _cordovaContactDenied: false,
  _hasCordova: computed(function() {
    return config.hasCordova;
  }),

  // Internal Handlers
  // -----------------

  didInitAttrs() {
    if (this.get('_hasCordova')) {
      this._nativeImport();
    }
  },

  _nativeImport() {
    // find all contacts
    this.set('_isLoading', true);
    const options = new window.ContactFindOptions();
    options.filter = '';
    options.multiple = true;
    const filter = ['displayName', 'phoneNumbers'];
    navigator.contacts.find(
      filter,
      this._onMobileSuccess.bind(this),
      this._onMobileFailure.bind(this),
      options
    );
  },

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

  _onMobileSuccess(data) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this.set('_cordovaContactDenied', false);

    // parse data into contact objects
    const contacts = data
      // remove contacts without any numbers
      .filter(contact => {
        return contact.phoneNumbers != null && contact.name.formatted != null;
      })
      .map(contact => {
        const numbers = contact.phoneNumbers.map(number => {
          // each number is an object with the number string stored in value
          return VcardUtils.formatNumber(number.value);
        });
        return ContactObject.create({ name: contact.name.formatted, numbers: numbers });
      });
    tryInvoke(this, 'onImport', [contacts]);
    this.set('_isLoading', false);
  },

  _onMobileFailure() {
    // if user rejects app access to contacts
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this.set('_isLoading', false);
    this.set('_cordovaContactDenied', true);
  },
});
