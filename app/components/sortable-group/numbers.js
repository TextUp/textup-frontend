import Ember from 'ember';
import defaultIfAbsent from '../../utils/default-if-absent';
import SupportsValidation from 'textup-frontend/mixins/component/supports-validation';

const { isPresent } = Ember;

export default Ember.Component.extend(SupportsValidation, {
  numbers: defaultIfAbsent([]),
  newNumber: defaultIfAbsent(''),
  readonly: defaultIfAbsent(false),
  inPlace: defaultIfAbsent(false),

  // called when a new number is added to the array
  // passed the number being added
  // returns nothing
  onAdd: null,
  // called when a number is removed from the array
  // passed the number being removed
  // returns nothing
  onRemove: null,

  classNames: 'sortable-group-numbers',

  // Computed properties
  // -------------------

  hasNumbers: Ember.computed.notEmpty('numbers'),
  $validateFields: 'input',
  $errorNeighbor: Ember.computed(function() {
    return this.$('.existing-numbers');
  }),

  // Events
  // ------

  didInsertElement: function() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', this, this._deepCopyNumbers);
  },
  didUpdateAttrs: function() {
    this._super(...arguments);
    if (this.get('_prevNumbers') !== this.get('numbers')) {
      Ember.run.scheduleOnce('afterRender', this, this._deepCopyNumbers);
    }
  },
  // need to do this to trigger changedAttributes for numbers
  _deepCopyNumbers: function() {
    if (this.get('inPlace') || this.isDestroying || this.isDestroyed) {
      return;
    }
    // true passed to copy for DEEP COPY so that before and after
    // in changed attributes does not return the same mutated version
    const newArray = Ember.copy(this.get('numbers'), true);
    this.set('numbers', newArray);
    this.set('_prevNumbers', newArray);
  },

  // Actions
  // -------

  actions: {
    storeNewNumber: function(val) {
      this.set('newNumber', val);
    },
    addNewNumber: function(val, isValid) {
      if (isValid && isPresent(val)) {
        this.get('numbers').pushObject({
          number: val
        });
        // call hook after change
        Ember.tryInvoke(this, 'onAdd', [val]);
        this.doValidate();
        this.set('newNumber', '');
      }
    },
    removeNumber: function(index) {
      const nums = this.get('numbers'),
        numToRemove = nums.objectAt(index);
      nums.removeAt(index);
      // call hook after change
      Ember.tryInvoke(this, 'onRemove', [numToRemove.number]);
      this.doValidate();
    },
    removeIfEmpty: function(index, val) {
      if (Ember.isBlank(val)) {
        this.send('removeNumber', index);
      }
    },
    updateNumber: function(numObj, index, newVal) {
      Ember.set(numObj, 'number', newVal);
    },
    reorderNumbers: function(itemModels) {
      this.set('numbers', itemModels);
    }
  }
});
