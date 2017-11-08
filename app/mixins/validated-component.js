import Ember from 'ember';
import defaultIfAbsent from '../utils/default-if-absent';

const {
  isPresent,
  computed,
  computed: { notEmpty, and, match },
  run,
  run: { scheduleOnce, debounce, next }
} = Ember;

export default Ember.Mixin.create({
  validateObj: null,
  validateField: null,
  validate: 'none', // top | bottom
  validateFreq: defaultIfAbsent(500),
  validateErrorClass: defaultIfAbsent('form-error'),

  $errors: null,

  // Private properties
  // ------------------

  _observedKey: null,

  // Computed properties
  // -------------------

  $errorNeighbor: computed(function() {
    return this.$();
  }),
  $validateFields: computed(function() {
    return this.$();
  }),
  hasVObj: notEmpty('validateObj'),
  hasVField: notEmpty('validateField'),
  hasValidate: match('validate', /^(top|bottom)$/i),
  canDoValidate: and('hasVObj', 'hasVField', 'hasValidate'),
  isTop: computed('canDoValidate', 'validate', function() {
    return this.get('canDoValidate') ? /^(top)$/i.test(this.get('validate')) : '';
  }),

  // Events
  // ------

  didInsertElement: function() {
    this._super(...arguments);

    scheduleOnce('afterRender', this, function() {
      // bind event handlers
      const eventsToBind = `
          focusout.${this.elementId}
          keyup.${this.elementId}
          paste.${this.elementId}
          cut.${this.elementId}
        `,
        fields = this.get('$validateFields'),
        threshold = this.get('validateFreq'),
        eventAction = function() {
          debounce(this, this.doValidate, threshold, false);
        }.bind(this);
      if (typeof fields === 'string') {
        this.$().on(eventsToBind, fields, eventAction);
      } else {
        fields.on(eventsToBind, eventAction);
      }
      // need to schedule next because we need to wait a little bit
      // for the validateObj to not be null, if it is present
      next(this, function() {
        // watch out if it's now destroyed after the wait
        if (this.isDestroying || this.isDestroyed) {
          return;
        }
        // observe field validity in case is changed by
        // dependence on another field
        if (this.get('canDoValidate')) {
          const $errors = this.get$Errors(),
            model = this.get('validateObj'),
            field = this.get('validateField'),
            key = `validateObj.validations.attrs.${field}.isValid`;
          this.addObserver(key, this, this._processValidate.bind(this, model, field, $errors));
          this.set('_observedKey', key);
        }
      });
    });
  },
  willDestroyElement: function() {
    this._super(...arguments);
    const $errors = this.get('$errors');
    if ($errors && $errors.length) {
      $errors.remove();
    }
    const fields = this.get('$validateFields');
    if (typeof fields === 'string') {
      this.$().off(`.${this.elementId}`);
    } else {
      fields.off(`.${this.elementId}`);
    }
    const observedKey = this.get('_observedKey');
    if (isPresent(observedKey)) {
      this.removeObserver(observedKey, this, this._processValidate);
    }
  },

  // Validation
  // ----------

  doValidate: function() {
    if (!this.get('canDoValidate')) {
      return;
    }
    const $errors = this.get$Errors(),
      model = this.get('validateObj'),
      field = this.get('validateField');
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    if (model && model.validate) {
      model
        .validate(
          {
            on: [field]
          },
          true
        )
        .then(this._processValidate.bind(this, model, field, $errors));
    }
  },
  _processValidate: function(model, field, $errors) {
    const $errorNeighbor = this.get('$errorNeighbor'),
      validateErrorClass = this.get('validateErrorClass');
    run(() => {
      if (model.get(`validations.attrs.${field}.isInvalid`)) {
        $errorNeighbor.addClass(validateErrorClass);
        $errors.text(model.get(`validations.attrs.${field}.message`));
      } else {
        $errorNeighbor.removeClass(validateErrorClass);
        $errors.text('');
      }
    });
  },

  // DOM construction
  // ----------------

  get$Errors: function() {
    if (this.get('$errors')) {
      return this.get('$errors');
    }
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    // lazily (on-demand) insert the errors object
    const $errorNeighbor = this.get('$errorNeighbor'),
      $errors = this._build$Errors();
    this.set('$errors', $errors);
    if (this.get('isTop')) {
      $errorNeighbor.before($errors);
    } else {
      $errorNeighbor.after($errors);
    }
    return $errors;
  },
  _build$Errors: function() {
    const validateErrorClass = this.get('validateErrorClass');
    return Ember.$(`<p class="${validateErrorClass}"></p>`);
  }
});
