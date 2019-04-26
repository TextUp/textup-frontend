import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import config from 'textup-frontend/config/environment';

const { computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    exportContacts: PropTypes.func.isRequired,
  },

  classNames: ['single-body', 'contacts-import'],

  init() {
    this._super(...arguments);
    console.log('...loading'); // create a loading class
    this.set('_contacts', []);

    if (config.hasCordova) {
      this.set('_hasCordova', true);
      this.importContacts();
      // this.fakeContacts();
    } else {
      this.set('_hasCordova', false);
    }
    console.log('finished loading');
  },

  importContacts() {
    // success callback
    const onSuccess = contacts => {
      var formatted = [];
      for (var i = 0; i < contacts.length; i++) {
        const name = contacts[i].name.formatted;
        const numbers = contacts[i].phoneNumbers;
        if (numbers !== null && numbers.length > 0) {
          formatted.push({ name: name, number: numbers });
        }
      }

      console.log(formatted);
      this.set('_contacts', formatted);
    };

    // failure callback
    const onError = contactError => {
      console.log('error');
      console.log(contactError);
    };

    // find all contacts
    const options = new window.ContactFindOptions();
    options.filter = '';
    options.multiple = true;
    const filter = ['displayName', 'phoneNumbers'];
    navigator.contacts.find(filter, onSuccess, onError, options);
  },

  fakeContacts() {
    var formatted = [];
    formatted.push({ name: 'Garret Kern', number: ['301-270-5376'] });
    formatted.push({ name: 'Eric Bai', number: ['111-111-1234', '456-456-1345'] });
    formatted.push({ name: 'Bryce Harper', number: ['991-123-0000'] });
    this.set('_contacts', formatted);
  },

  // Helpers
  // -------
  _submitContacts() {
    const contacts = this.get('_contacts').filter(function(value, index) {
      return document.getElementById(index.toString()).checked;
    });
    console.log(contacts);
    return contacts;
  },

  _handleUpload(event) {
    const fr = new FileReader();
    fr.onloadend = event => {
      const contents = event.target.result,
        error = event.target.error;
      if (error != null) {
        console.log('Error reading file', error);
      } else {
        this._parseVcard(contents);
      }
    };
    fr.readAsText(event.target.files[0]);
  },

  // Actions
  // -------
  _parseVcard(contents) {
    const contacts = contents.split('BEGIN:VCARD');
    const namePattern = new RegExp('[F][N][:].*');
    const numPattern = new RegExp('[T][E][L][;].*');
    const numTrim = new RegExp('[\\-\\s+()]', 'g');
    const nameTrim = new RegExp('[/\\\\]', 'g');

    var formatted = [];

    for (var i = 0; i < contacts.length; i++) {
      const curContact = contacts[i].split('\n');
      var numbers = [];
      var name = '';

      for (var j = 0; j < curContact.length; j++) {
        if (namePattern.test(curContact[j])) {
          name = curContact[j].substring(3).replace(nameTrim, '');
        } else if (numPattern.test(curContact[j])) {
          var number = curContact[j].substring(curContact[j].indexOf(':') + 1).replace(numTrim, '');
          // remove leading 1 for US numbers
          if (number.length > 10 && number[0] === '1') {
            number = number.substring(1);
          }
          if (numbers.indexOf(number) === -1) {
            numbers.push(number);
          }
        }
      }
      if (name !== '' && numbers.length !== 0) {
        formatted.push({ name: name, number: numbers });
      }
    }
    this.set('_contacts', formatted);
  },

  _selectAll() {
    var checkboxes = document.getElementsByName('box');
    for (var i = 0, n = checkboxes.length; i < n; i++) {
      checkboxes[i].checked = true;
    }
  },

  _deselectAll() {
    var checkboxes = document.getElementsByName('box');
    for (var i = 0, n = checkboxes.length; i < n; i++) {
      checkboxes[i].checked = false;
    }
  },

  // Computed Values
  // ---------------
  _hasContacts: computed('_contacts', function() {
    return this.get('_contacts').length > 0;
  }),
});
