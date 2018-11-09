import Ember from 'ember';
import defaultIfAbsent from '../../utils/default-if-absent';

export default Ember.Component.extend({
  displayProperty: null,
  placeholder: defaultIfAbsent(''),
  itemClass: defaultIfAbsent(''),
  autoCloseEdit: defaultIfAbsent(true),
  data: defaultIfAbsent([]),

  doRegister: null,
  onUpdate: null,
  onInsert: null,
  onRemove: null,
  onInputStart: null,
  onInput: null,

  classNames: 'single-select-input',

  // Computed properties
  // -------------------

  selected: Ember.computed.alias('data.firstObject'),
  hasSelected: Ember.computed.notEmpty('selected'),
  inputObj: Ember.computed(function() {
    return this.$().find('.single-select-input-edit .form-control');
  }),
  displayObj: Ember.computed(function() {
    return this.$().children('.single-select-input-display');
  }),
  publicAPI: Ember.computed(function() {
    return {
      currentVal: '',
      isCreating: false,
      isEditing: false,
      currentlyEditing: null,
      actions: {
        clear: this.removeAndClearInput.bind(this),
        insert: this.insertOrUpdate.bind(this),
        update: this.insertOrUpdate.bind(this),
        focus: this.ensureFocus.bind(this),
        stopEditing: this.stopInput.bind(this)
      }
    };
  }),
  isInputting: Ember.computed.or('publicAPI.isCreating', 'publicAPI.isEditing'),
  canClear: Ember.computed.notEmpty('publicAPI.currentVal'),

  // Events
  // ------

  didInitAttrs: function() {
    this._super(...arguments);
    Ember.tryInvoke(this, 'doRegister', [this.get('publicAPI')]);
  },
  willDestroyElement: function() {
    this.cleanupAutocloseHandler();
  },

  // Actions
  // -------

  actions: {
    startInput: function(event) {
      if (this.get('_disableOpenUntilKeyup')) {
        this.set('_disableOpenUntilKeyup', false);
        return;
      }
      if (event.type === 'keypress') {
        // open on enter
        if (event.which === 13) {
          this.startInput(event);
        }
      } else {
        this.startInput(event);
      }
    },
    handleInput: function(event) {
      const val = event.target.value,
        isEmpty = Ember.isEmpty(val),
        isBlank = Ember.isBlank(val);
      this.set('publicAPI.currentVal', val);
      Ember.tryInvoke(this, 'onInput', [val, event]);
      if (event.which === 27 && !isEmpty) {
        // escape
        this.removeAndClearInput();
      } else if (event.which === 13 && !isEmpty) {
        // enter
        this.insertOrUpdate(event);
      } else if (event.which === 8 && (isEmpty || isBlank)) {
        // backspace
        this.removeAndClearInput();
      }
    },
    removeAndClearInput: function() {
      this.removeAndClearInput();
    }
  },

  // Input
  // -----

  startInput: function(event) {
    const $el = this.$(),
      $input = this.get('inputObj'),
      val = $input.val();
    $el.addClass('editing');
    Ember.tryInvoke(this, 'onInputStart', [val, event]);
    Ember.run.scheduleOnce('afterRender', this, this.ensureFocus);

    this.setProperties({
      'publicAPI.currentVal': val,
      _originalVal: val,
      _shouldRestoreOriginal: true
    });
    if (this.get('hasSelected')) {
      this.setProperties({
        'publicAPI.isCreating': false,
        'publicAPI.isEditing': true,
        'publicAPI.currentlyEditing': this.get('selected')
      });
    } else {
      this.setProperties({
        'publicAPI.isCreating': true,
        'publicAPI.isEditing': false,
        'publicAPI.currentlyEditing': null
      });
    }

    if (this.get('autoCloseEdit')) {
      Ember.$(document).on(
        `click.${this.elementId}`,
        function(event) {
          if (!Ember.$(event.target).closest(this.$()).length) {
            this.stopInput();
            this.cleanupAutocloseHandler();
          }
        }.bind(this)
      );
    }
  },
  insertOrUpdate: function(event) {
    if (event.type.indexOf('key') !== -1) {
      this.set('_disableOpenUntilKeyup', true);
    }
    const val = this.get('inputObj').val();
    let result;
    if (this.get('hasSelected')) {
      result = Ember.tryInvoke(this, 'onUpdate', [this.get('selected'), val, event]);
    } else {
      result = Ember.tryInvoke(this, 'onInsert', [val, event]);
    }
    if (result && result.then) {
      result.then(() => {
        this.set('_shouldRestoreOriginal', false);
        this.stopInput();
      });
    } else {
      this.set('_shouldRestoreOriginal', false);
      this.stopInput();
    }
  },
  removeAndClearInput: function() {
    // run next to allow click out to close handler to run first
    Ember.run.next(this, function() {
      this.get('inputObj').val('');
      this.set('publicAPI.currentVal', '');
      if (this.get('hasSelected')) {
        Ember.tryInvoke(this, 'onRemove', [this.get('selected')]);
      }
      Ember.run.scheduleOnce('afterRender', this, this.ensureFocus);
      this.setProperties({
        'publicAPI.isCreating': true,
        'publicAPI.isEditing': false,
        'publicAPI.currentlyEditing': null,
        _shouldRestoreOriginal: false,
        _originalVal: ''
      });
    });
  },
  stopInput: function() {
    const $el = this.$(),
      $input = this.get('inputObj');
    this.cleanupAutocloseHandler();
    $el.removeClass('editing');
    if (this.get('_shouldRestoreOriginal')) {
      $input.val(this.get('_originalVal'));
    }
    this.setProperties({
      'publicAPI.isCreating': false,
      'publicAPI.isEditing': false,
      'publicAPI.currentlyEditing': null,
      _shouldRestoreOriginal: false,
      _originalVal: ''
    });
    Ember.run.scheduleOnce('afterRender', this, this.ensureFocus);
  },

  // Focus
  // -----

  ensureFocus: function() {
    if (this.get('isInputting')) {
      this.get('inputObj').focus();
    } else {
      this.get('displayObj').focus();
    }
  },

  // Helpers
  // -------

  cleanupAutocloseHandler: function() {
    Ember.$(document).off(`.${this.elementId}`);
  }
});
