import Ember from 'ember';
import defaultIfAbsent from 'textup-frontend/utils/default-if-absent';

const {
  $,
  computed,
  run: { scheduleOnce },
} = Ember;

export default Ember.Component.extend({
  val: defaultIfAbsent(''),
  numDigits: defaultIfAbsent(false), // if specified, should be a positive integer
  disabled: defaultIfAbsent(false),
  hasError: defaultIfAbsent(false),
  showAlphabet: defaultIfAbsent(false),
  tabindex: defaultIfAbsent(0),

  // passed current value
  // returns nothing but updates current value
  doChange: null,
  // passed current value
  // returns nothing and no notable side effects
  onFull: null,
  // ONLY TRIGGERED IF FULL
  // passed current value
  // returns nothing and no notable side effects
  onSubmit: null,

  classNames: 'number-control',
  classNameBindings: [
    'disabled:form-disabled',
    'hasError:form-error',
    'showAlphabet:show-alphabet',
  ],
  attributeBindings: ['tabindex:tabIndex'],

  // Computed properties
  // -------------------

  tabIndex: computed('tabindex', function() {
    const ind = this.get('tabindex');
    return this.get('disabled') || ind === false ? null : ind;
  }),
  _isFull: computed('numDigits', 'val', function() {
    const numDigits = this.get('numDigits');
    return !!(numDigits && this.get('val.length') === numDigits);
  }),

  // Events
  // ------

  didInsertElement() {
    this._super(...arguments);
    const elId = this.elementId,
      events = `click.${elId} touchend.${elId}`;
    this.$('.number-control-item').on(events, this.addFromUserInput.bind(this));
    this.$('.number-control-remove').on(events, this.removeByUserInput.bind(this));
  },
  willDestroyElement() {
    this._super(...arguments);
    const elId = this.elementId,
      events = `click.${elId} touchend.${elId}`;
    this.$('.number-control-item').off(events);
    this.$('.number-control-remove').off(events);
  },
  didUpdateAttrs() {
    if (this.get('_isFull')) {
      scheduleOnce('afterRender', this, this.handleOnFull);
    }
  },
  keyDown(event) {
    // disable going back in history for backspace
    if (!this.get('disabled') && event.which === 8) {
      event.preventDefault();
      return false;
    }
  },
  keyUp(event) {
    if (event.which >= 48 && event.which <= 57) {
      // numeric keys
      this.appendToVal(String.fromCharCode(event.which));
    } else if (event.which === 8) {
      // backspace
      this.removeLastFromVal();
    } else if (event.which === 13 && this.get('_isFull')) {
      // enter
      this.handleOnSubmit();
    }
  },

  // Modify value
  // ------------

  addFromUserInput(event) {
    const val = $(event.currentTarget).attr('data-value');
    this.appendToVal(val);
    // stop click event from being called if touchend is called first
    event.stopImmediatePropagation();
    return false;
  },
  removeByUserInput(event) {
    this.removeLastFromVal();
    // stop click event from being called if touchend is called first
    event.stopImmediatePropagation();
    return false;
  },

  // Hooks
  // -----

  appendToVal(char) {
    if (this.get('disabled')) {
      return;
    }
    const numDigits = this.get('numDigits'),
      val = this.get('val');
    if (!numDigits || (numDigits && val.length < numDigits)) {
      Ember.tryInvoke(this, 'doChange', [val + char]);
    }
  },
  removeLastFromVal() {
    if (this.get('disabled')) {
      return;
    }
    Ember.tryInvoke(this, 'doChange', [this.get('val').slice(0, -1)]);
  },
  handleOnFull() {
    if (this.get('disabled')) {
      return;
    }
    Ember.tryInvoke(this, 'onFull', [this.get('val')]);
  },
  handleOnSubmit() {
    if (this.get('disabled')) {
      return;
    }
    Ember.tryInvoke(this, 'onSubmit', [this.get('val')]);
  },
});
