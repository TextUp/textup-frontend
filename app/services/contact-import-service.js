import Ember from 'ember';

const { computed } = Ember;

// TODO - test this service

export default Ember.Service.extend({
  contactService: Ember.inject.service(),

  // Properties
  // ----------
  contactsSelected: [],
  contactsUploaded: [],
  hasContactsSelected: computed.notEmpty('contactsSelected'),
  hasContactsUploaded: computed.notEmpty('contactsUploaded'),
  numSaved: 0,
  numTotal: 0,
  _numFailed: 0,
  isSaving: false,

  // Methods
  // -------

  saveContacts() {
    const contactService = this.get('contactService');
    const toImport = this.get('contactsSelected');
    this.resetData();
    this.set('numTotal', toImport.length);
    this.set('isSaving', true);

    // 1. return an empty contact model obj (synchronous)
    for (let i = 0; i < toImport.length; i++) {
      const newContact = contactService.createNew();
      const curContact = toImport[i];

      // 2. update the properties on that new model obj
      newContact.set('name', curContact.name);
      newContact.set(
        'numbers',
        curContact.numbers.map(num => {
          return { number: num };
        })
      );

      // 3. save it (asynchronous)
      contactService
        .persistNewAndTryAddToPhone(newContact)
        .then(this._onSaveSuccess.bind(this), this._onSaveFailure.bind(this))
        .finally(this._onSaveFinish.bind(this));
      //contactService.persistNewAndTryAddToPhone
      // in the `then` handler keep track of # complete vs # started
    }
  },

  resetData() {
    this.set('contactsUploaded', []);
    this.set('contactsSelected', []);
    this.set('numSaved', 0);
    this.set('_numFailed', 0);
  },

  // Internal
  // --------

  _onSaveSuccess() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this.set('numSaved', this.get('numSaved') + 1);
  },

  _onSaveFailure() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this.set('_numFailed', this.get('_numFailed') + 1);
  },

  _onSaveFinish() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    if (this.get('_numFailed') + this.get('numSaved') === this.get('numTotal')) {
      this.set('isSaving', false);
    }
  },
});
