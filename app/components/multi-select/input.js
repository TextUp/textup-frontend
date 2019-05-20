import Component from '@ember/component';
import $ from 'jquery';
import { isBlank, isEmpty, tryInvoke } from '@ember/utils';
import { computed } from '@ember/object';
import { scheduleOnce, next } from '@ember/runloop';
import defaultIfAbsent from '../../utils/default-if-absent';

export default Component.extend({
  displayProperty: null,
  placeholder: defaultIfAbsent(''),
  itemClass: defaultIfAbsent(''),
  autoCloseEdit: defaultIfAbsent(true),
  data: defaultIfAbsent([]),
  // passed tag object, input value, event
  // returns Promise, updates tag array, success closes editing, failure stays in editing
  // returning not Promise defaults to closing editing
  onUpdate: null, // triggered on focusout or enter
  // passed input value, event
  // returns Promise, updates tag array, success clears input, failure preserves input
  // returning not Promise defaults to preserving input
  onInsert: null, // triggered on focusout or enter
  // passed tag object
  // returns nothing, updates tag array
  onRemove: null,
  // passed input value, event
  // returns nothing
  onInputStart: null, // input can be either creating new or editing
  // passed input value
  // returns nothing
  onInput: null, // input can be either creating new or editing
  // passed publicAPI
  // returns nothing
  doRegister: null,

  classNames: 'multi-select-input',
  tabindex: -1,
  attributeBindings: ['tabindex'],

  // Computed properties
  // -------------------

  anyData: computed('data.[]', function() {
    return this.get('data.length') > 0;
  }),
  inputObj: computed(function() {
    return this.$().children('input.multi-select-input-item');
  }),
  publicAPI: computed(function() {
    return {
      currentVal: '',
      isCreating: false,
      isEditing: false,
      currentlyEditing: null,
      actions: {
        clear: this.clearInput.bind(this),
        insert: this.insert.bind(this),
        update: this.updateOnEvent.bind(this),
        focus: this.ensureFocus.bind(this),
        stopEditing: this.resetEditing.bind(this),
      },
    };
  }),

  // Events
  // ------

  init() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('publicAPI')]);
  },
  didInsertElement() {
    this._super(...arguments);
    this.$()
      // this event handles setting the focus class
      .on('focusin.${this.elementId}', '.multi-select-input-item', this._focusIn.bind(this))
      // these two events handle keyboard navigation for existing
      // data and triggering editing
      .on(
        'keydown.${this.elementId}',
        '.multi-select-input-item:not(input)',
        this._suppressBack.bind(this)
      )
      .on(
        'keyup.${this.elementId}',
        '.multi-select-input-item:not(input)',
        this._handleNonInputKeyUp.bind(this)
      )
      .on(
        'dblclick.${this.elementId} touchend.${this.elementId}',
        '.multi-select-input-item .display-label',
        this._startEditing.bind(this)
      )
      // notify that we are starting creating or updating
      .on('focusin.${this.elementId}', 'input', this._inputStart.bind(this));
    this.get('inputObj')
      .on(
        'focusin.${this.elementId}',
        function(event) {
          this.setProperties({
            'publicAPI.isCreating': true,
            'publicAPI.currentVal': this.$(event.target).val(),
          });
        }.bind(this)
      )
      .on(
        'focusout.${this.elementId}',
        function() {
          this.set('publicAPI.isCreating', false);
        }.bind(this)
      );
  },
  willDestroyElement() {
    this._super(...arguments);
    this.get('inputObj').off(`.${this.elementId}`);
    this.$().off(`.${this.elementId}`);
  },
  focusOut() {
    // any time this element or any of its children lose focus,
    // remove all focus classes for a clean slate
    this.$().removeClass('focus');
    this._findFocusedNode().removeClass('focus');
  },
  focusIn() {
    this.ensureFocus();
  },

  // Actions
  // -------

  actions: {
    removeViaButton(event) {
      const { node: $node, object } = this._getDataFromEvent(event);
      this.remove(object, $node);
    },
    handleUpdateInput(event) {
      const { node: $node, object } = this._getDataFromEvent(event),
        $input = $(event.target),
        inputVal = $input.val(),
        isValEmpty = isEmpty(inputVal);
      this.set('publicAPI.currentVal', inputVal);
      // set restore flag to true because the only time we don't
      // want to restore the original value is when the update
      // goes through successfully
      this._shouldRestoreOriginal = true;
      if (event.which === 13 || event.which === 27) {
        // enter, escape
        this.update(object, $input, $node, event);
      } else if ((event.which === 8 || event.which === 46) && isValEmpty) {
        // backspace, delete
        this.remove(object, $node);
      } else {
        this._inputChange(inputVal, event);
      }
    },
    handlePastedInput(event) {
      // need to schedule next because when the paste event fires on iOS safari,
      // the value of the input field has not yet been updated
      next(
        this,
        function(event) {
          const inputVal = this.get('inputObj').val();
          this.set('publicAPI.currentVal', inputVal);
          this._inputChange(inputVal, event);
        },
        event
      );
    },
    handleNewInput(event) {
      const $input = this.get('inputObj'),
        inputVal = $input.val(),
        inputEmpty = isEmpty(inputVal),
        inputBlank = isBlank(inputVal),
        anyData = this.get('anyData');
      this.set('publicAPI.currentVal', inputVal);
      if (event.which === 13 && !inputEmpty) {
        // enter
        this.insert(event);
      } else if (event.which === 27) {
        // escape
        this.clearInput();
      } else if (
        event.which === 8 &&
        inputEmpty &&
        anyData &&
        isEmpty(this.get('_lastInputValue'))
      ) {
        // backspace
        const $prev = this._getPrevItem($input),
          prevObj = this._getObjectFromNode($prev);
        this.remove(prevObj, $prev);
      } else if (event.which === 37 && (inputEmpty || inputBlank) && anyData) {
        // left arrow and empty
        if (inputBlank) {
          this.clearInput();
        }
        this._focusBefore();
      } else {
        this._inputChange(inputVal, event);
      }
    },
  },

  // Hook handlers
  // -------------

  insert(event) {
    const $input = this.get('inputObj'),
      result = tryInvoke(this, 'onInsert', [$input.val(), event]);
    if (result && result.then) {
      result.then(() => this.clearInput());
    }
  },
  updateOnEvent(event) {
    if (this.get('publicAPI.isEditing')) {
      const $input = this.get('_$editingInput'),
        $node = $input.closest('.tag-item'),
        object = this.get('publicAPI.currentlyEditing');
      this.update(object, $input, $node, event);
    }
  },
  update(object, $input, $node, event) {
    const inputVal = $input.val(),
      isValEmpty = isEmpty(inputVal);
    if (isValEmpty || inputVal === this.get('_originalBeforeEdits')) {
      this._stopEditing($input, $node);
    } else {
      const result = tryInvoke(this, 'onUpdate', [object, $input.val(), event]);
      if (result && result.then) {
        result.then(() => {
          // on success, stop editing and don't revert
          this._shouldRestoreOriginal = false;
          this._stopEditing($input, $node);
        });
      } else {
        // if not promise, we assumed success
        this._shouldRestoreOriginal = false;
        this._stopEditing($input, $node);
      }
    }
  },
  remove(object, $node) {
    if (object) {
      // ignore if only the input field remaining
      // run next to allow click out to close handler to run first
      next(this, function() {
        const $next = this._getNextItem($node);
        tryInvoke(this, 'onRemove', [object]);
        scheduleOnce('afterRender', this, function() {
          this.resetEditing();
          $next.focus();
          // for edge case when multiple data are removed
          this.ensureFocus();
        });
      });
    }
  },
  _inputStart(event) {
    this.set('_lastInputValue', event.target.value);
    tryInvoke(this, 'onInputStart', [event.target.value, event]);
  },
  _inputChange(inputVal, event) {
    if (this.get('_lastInputValue') !== inputVal) {
      tryInvoke(this, 'onInput', [inputVal, event]);
    }
    this.set('_lastInputValue', inputVal);
  },
  clearInput() {
    const $input = this.get('inputObj');
    if ($input) {
      $input.val('');
    }
    this.set('publicAPI.currentVal', '');
  },

  // Keyboard navigation
  // -------------------

  _suppressBack(event) {
    const creating = this.get('publicAPI.isCreating'),
      editing = this.get('publicAPI.isEditing');
    // stop default behavior on backspace which is to go back a page
    if (!creating && !editing && event.which === 8) {
      event.preventDefault();
    }
  },
  _handleNonInputKeyUp(event) {
    if (!this.get('publicAPI.isEditing')) {
      if (event.which === 13) {
        //start editing on enter
        this._startEditing(event);
      } else if (event.which === 39) {
        // right arrow
        this._focusAfter();
      } else if (event.which === 37) {
        // left arrow
        this._focusBefore();
      } else if (event.which === 8 || event.which === 46) {
        // backspace, delete
        const { node: $node, object } = this._getDataFromEvent(event);
        this.remove(object, $node);
      }
    }
  },
  _focusIn(event) {
    const $el = this.$();
    $el.addClass('focus');
    this._getDataFromEvent(event).node.addClass('focus');
  },
  _startEditing(event) {
    const { node: $node, object } = this._getDataFromEvent(event),
      $edit = $node.find('input.edit-multi-select-input-item'),
      original = $edit.val();
    this.resetEditing();
    $node.addClass('editing');
    this.setProperties({
      'publicAPI.currentlyEditing': object,
      'publicAPI.isEditing': true,
      _$editingInput: $edit,
      _originalBeforeEdits: original,
      _shouldRestoreOriginal: false,
    });
    scheduleOnce('afterRender', this, function() {
      $edit.focus();
      if (this.get('autoCloseEdit')) {
        $edit.on(
          'focusout',
          function() {
            this.resetEditing();
            $edit.off('focusout'); //remove this handler
          }.bind(this)
        );
      }
    });
  },
  _stopEditing($edit, $node) {
    this.resetEditing();
    scheduleOnce('afterRender', this, function() {
      $node.focus();
    });
  },
  resetEditing() {
    if (this.isDestroying) {
      return;
    }
    this.$()
      .children('.multi-select-input-item')
      .removeClass('editing');
    if (this.get('_shouldRestoreOriginal')) {
      this.get('_$editingInput').val(this.get('_originalBeforeEdits'));
    }
    this.setProperties({
      'publicAPI.currentlyEditing': null,
      'publicAPI.isEditing': false,
      _$editingInput: null,
      _originalBeforeEdits: null,
      _shouldRestoreOriginal: false,
    });
  },

  // Focus methods
  // -------------

  ensureFocus() {
    // if none of the tag items are selected, select the input object
    if (!this._findFocusedNode().length) {
      this.get('inputObj').focus();
    }
  },
  _focusBefore() {
    const $prev = this._getPrevItem(this._findFocusedNode());
    if ($prev && $prev.length) {
      $prev.focus();
    }
  },
  _focusAfter() {
    const $next = this._getNextItem(this._findFocusedNode());
    if ($next && $next.length) {
      $next.focus();
    }
  },
  _findFocusedNode() {
    return this.$().children('.multi-select-input-item.focus');
  },

  // Helper methods
  // --------------

  _getPrevItem($node) {
    return $node.prev('.multi-select-input-item');
  },
  _getNextItem($node) {
    return $node.next('.multi-select-input-item');
  },
  _getObjectFromNode($node) {
    const arrayIndex = $node.attr('data-index');
    return this.get('data')[arrayIndex];
  },
  _getDataFromEvent(event) {
    const $target = $(event.target),
      $node = $target.hasClass('multi-select-input-item')
        ? $target
        : $target.closest('.multi-select-input-item');
    return {
      node: $node,
      object: this._getObjectFromNode($node),
    };
  },
});
