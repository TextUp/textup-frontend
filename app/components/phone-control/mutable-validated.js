import Ember from 'ember';

const { tryInvoke } = Ember;

export default Ember.Component.extend({
  onChange: null,
  onClick: null,
  onValidate: null,
  onValidateStart: null,
  onValidateSuccess: null,

  // Injected services
  // -----------------

  verifyNumberService: Ember.inject.service(),

  // Computed Properties
  // -------------------

  _newNumber: '',

  actions: {
    updateNew(num) {
      this.set('_newNumber', num);
      tryInvoke(this, 'onChange', [num]);
    },
    verifyNew(num) {
      tryInvoke(this, 'onClick', [num]);
      tryInvoke(this, 'onValidateStart', [num]);
      this.get('verifyNumberService')
        .start(num)
        .then(() => this.set('_newNumber', num));
    },
    completeVerify(validationCode, num) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        tryInvoke(this, 'onValidate', [num]);
        this.get('verifyNumberService')
          .finish(num, validationCode)
          .then(() => {
            this.set('number', num);
            this.set('_newNumber', num);
            tryInvoke(this, 'onValidateSuccess', [num]);
            resolve();
          }, reject);
      });
    },
  },
});
