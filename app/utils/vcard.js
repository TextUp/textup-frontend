import Ember from 'ember';
import { ContactObject } from 'textup-frontend/objects/contact-object';

// Regex patterns from parsing vcard
const namePattern = new RegExp('[F][N][:].*');
const numPattern = new RegExp('[T][E][L][;].*');
const numTrim = new RegExp('[\\-\\s+()]', 'g');
const nameTrim = new RegExp('[/\\\\]', 'g');

// process an event from input element for vcard
export function process(event) {
  return new Ember.RSVP.Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onloadend = _onFileLoad.bind(null, resolve, reject);
    fr.readAsText(event.target.files[0]);
  });
}

// create a function to call once file loaded
export function _onFileLoad(resolve, reject, event) {
  const contents = event.target.result,
    error = event.target.error;
  if (error != null) {
    reject();
    return;
  } else {
    const contacts = _parseVcard(contents);
    if (contacts.length === 0) {
      reject();
      return;
    }
    resolve(contacts);
  }
}

function _parseVcard(contents) {
  let results = [];
  const contacts = contents.split('BEGIN:VCARD');

  // loop through each contact item in vcard
  for (let i = 0; i < contacts.length; i++) {
    // contact items have a number of lines:
    // each line declares some piece of information, ex: name, number
    const contactInfo = contacts[i].split('\n');
    const contactObject = _parseIndividual(contactInfo);

    // if no name or number then don't add to contact list
    if (contactObject.name !== '' && contactObject.numbers.length !== 0) {
      results.push(contactObject);
    }
  }
  return results;
}

// parse a vcard contact object
function _parseIndividual(contactInfo) {
  let name = '';
  let numbers = [];

  // loop through lines of contact to extract name and number
  for (let j = 0; j < contactInfo.length; j++) {
    // check lines for name pattern
    if (namePattern.test(contactInfo[j])) {
      name = contactInfo[j].substring(3).replace(nameTrim, '');
    }
    // check line for number pattern
    if (numPattern.test(contactInfo[j])) {
      let number = contactInfo[j].substring(contactInfo[j].indexOf(':') + 1).replace(numTrim, '');
      // remove leading 1 for US numbers
      if (number.length > 10 && number[0] === '1') {
        number = number.substring(1);
      }
      // don't add duplicate numbers
      if (numbers.indexOf(number) === -1) {
        numbers.push(number);
      }
    }
  }
  return ContactObject.create({ name: name, numbers: numbers });
}
