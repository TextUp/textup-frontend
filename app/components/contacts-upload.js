import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import config from 'textup-frontend/config/environment';
import { ContactObject } from 'textup-frontend/objects/contact-object';

const { tryInvoke, computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    onImport: PropTypes.func.isRequired,
  },

  _handleChange(event) {
    const fr = new FileReader();

    fr.onloadend = event => {
      const contents = event.target.result,
        error = event.target.error;
      if (error != null) {
        this.set('_isError', true);
      } else {
        this._parseVcard(contents);
        if (this.get('_contacts').length === 0) {
          this.set('_isError', true);
        }
        tryInvoke(this, 'onImport', [this.get('_contacts')]);
      }
      this.set('_isLoading', false);
      this.set('_isLoaded', true);
    };

    this.set('_isError', false);
    if (event.target.files.length > 0) {
      this.set('_isLoading', true);
      try {
        fr.readAsText(event.target.files[0]);
      } catch (err) {
        console.log('ERROR');
        this.set('_isError', true);
      }
    } else {
      this.set('_isLoaded', false);
    }
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
          // remove duplicate numbers from same contact
          if (numbers.indexOf(number) === -1) {
            numbers.push(number);
          }
        }
      }
      if (name !== '' && numbers.length !== 0) {
        formatted.push(ContactObject.create({ name: name, numbers: numbers }));
      }
    }
    this.set('_contacts', formatted);
  },

  // Computed Values
  // ---------------
  _hasCordova: computed(function() {
    return config.hasCordova;
  }),
});
