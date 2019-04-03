import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    exportContacts: PropTypes.func.isRequired,
  },

  classNames: ['single-body', 'contacts-import'],

  init() {
    this._super(...arguments);
    console.log('...loading'); // create a loading class
    //this.importContacts();
    this.fakeContacts();
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
  _parseVcard(contents) {
    console.log('PARSE CALLED');
    const contacts = contents.split('BEGIN:VCARD');
    const namePattern = new RegExp('[F][N][:].*');
    const numPattern = new RegExp('[T][E][L].*');
    const trim = new RegExp('[ ()-+]', 'g');

    console.log(contacts);

    for (var i = 0; i < contacts.length; i++) {
      const curContact = contacts[i].split('\n');
      for (var j = 0; j < curContact.length; j++) {
        if (namePattern.test(curContact[j])) {
          const name = curContact[j].substring(3);
          console.log(name);
        } else if (numPattern.test(curContact[j])) {
          const number = curContact[j].substring(curContact[j].indexOf(':') + 1).replace(trim, '');
          console.log(number);
        }
      }
    }
  },
});
