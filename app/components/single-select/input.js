import $ from 'jquery';
import { scheduleOnce, next } from '@ember/runloop';
import { tryInvoke, isEmpty, isBlank } from '@ember/utils';
import { computed } from '@ember/object';
import { alias, notEmpty, or } from '@ember/object/computed';
import Component from '@ember/component';
import defaultIfAbsent from '../../utils/default-if-absent';

export default Component.extend({
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

  selected: alias('data.firstObject'),
  hasSelected: notEmpty('selected'),
  inputObj: computed(function() {
    return this.$().find('.single-select-input-edit .form-control');
  }),
  displayObj: computed(function() {
    return this.$().children('.single-select-input-display');
  }),
  publicAPI: computed(function() {
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
        stopEditing: this.stopInput.bind(this),
      },
    };
  }),
  isInputting: or('publicAPI.isCreating', 'publicAPI.isEditing'),
  canClear: notEmpty('publicAPI.currentVal'),

  // Events
  // ------

  init() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('publicAPI')]);
  },
  willDestroyElement() {
    this.cleanupAutocloseHandler();
  },

  // Actions
  // -------

  actions: {
    startInput(event) {
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
    handleInput(event) {
      const val = event.target.value,
        emptyResult = isEmpty(val),
        blankResult = isBlank(val);
      this.set('publicAPI.currentVal', val);
      tryInvoke(this, 'onInput', [val, event]);
      if (event.which === 27 && !emptyResult) {
        // escape
        this.removeAndClearInput();
      } else if (event.which === 13 && !emptyResult) {
        // enter
        this.insertOrUpdate(event);
      } else if (event.which === 8 && (emptyResult || blankResult)) {
        // backspace
        this.removeAndClearInput();
      }
    },
    removeAndClearInput() {
      this.removeAndClearInput();
    },
  },

  // Input
  // -----

  startInput(event) {
    const $el = this.$(),
      $input = this.get('inputObj'),
      val = $input.val();
    $el.addClass('editing');
    tryInvoke(this, 'onInputStart', [val, event]);
    scheduleOnce('afterRender', this, this.ensureFocus);

    this.setProperties({
      'publicAPI.currentVal': val,
      _originalVal: val,
      _shouldRestoreOriginal: true,
    });
    if (this.get('hasSelected')) {
      this.setProperties({
        'publicAPI.isCreating': false,
        'publicAPI.isEditing': true,
        'publicAPI.currentlyEditing': this.get('selected'),
      });
    } else {
      this.setProperties({
        'publicAPI.isCreating': true,
        'publicAPI.isEditing': false,
        'publicAPI.currentlyEditing': null,
      });
    }

    if (this.get('autoCloseEdit')) {
      $(document).on(
        `click.${this.elementId}`,
        function(event) {
          if (!$(event.target).closest(this.$()).length) {
            this.stopInput();
            this.cleanupAutocloseHandler();
          }
        }.bind(this)
      );
    }
  },
  insertOrUpdate(event) {
    if (event.type.indexOf('key') !== -1) {
      this.set('_disableOpenUntilKeyup', true);
    }
    const val = this.get('inputObj').val();
    let result;
    if (this.get('hasSelected')) {
      result = tryInvoke(this, 'onUpdate', [this.get('selected'), val, event]);
    } else {
      result = tryInvoke(this, 'onInsert', [val, event]);
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
  removeAndClearInput() {
    // run next to allow click out to close handler to run first
    next(this, function() {
      this.get('inputObj').val('');
      this.set('publicAPI.currentVal', '');
      if (this.get('hasSelected')) {
        tryInvoke(this, 'onRemove', [this.get('selected')]);
      }
      scheduleOnce('afterRender', this, this.ensureFocus);
      this.setProperties({
        'publicAPI.isCreating': true,
        'publicAPI.isEditing': false,
        'publicAPI.currentlyEditing': null,
        _shouldRestoreOriginal: false,
        _originalVal: '',
      });
    });
  },
  stopInput() {
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
      _originalVal: '',
    });
    scheduleOnce('afterRender', this, this.ensureFocus);
  },

  // Focus
  // -----

  ensureFocus() {
    if (this.get('isInputting')) {
      this.get('inputObj').focus();
    } else {
      this.get('displayObj').focus();
    }
  },

  // Helpers
  // -------

  cleanupAutocloseHandler() {
    $(document).off(`.${this.elementId}`);
  },
});
