import Ember from 'ember';
import callIfPresent from '../../utils/call-if-present';
import defaultIfAbsent from '../../utils/default-if-absent';

export default Ember.Component.extend({
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

	anyData: Ember.computed('data.[]', function() {
		return this.get('data.length') > 0;
	}),
	inputObj: Ember.computed(function() {
		return this.$().children('input.multi-select-input-item');
	}),
	publicAPI: Ember.computed(function() {
		return {
			currentVal: '',
			isCreating: false,
			isEditing: false,
			currentlyEditing: null,
			actions: {
				clear: function() {
					this.clearInput(this.get('inputObj'));
				}.bind(this),
				insert: this.insert.bind(this),
				update: function(event) {
					if (this.get('publicAPI.isEditing')) {
						const $input = this.get('_$editingInput'),
							$node = $input.closest('.tag-item'),
							object = this.get('publicAPI.currentlyEditing');
						this.update(object, $input, $node, event);
					}
				}.bind(this),
				focus: this.ensureFocus.bind(this),
				stopEditing: this.resetEditing.bind(this)
			}
		};
	}),

	// Events
	// ------

	didInitAttrs: function() {
		this._super(...arguments);
		callIfPresent(this.get('doRegister'), this.get('publicAPI'));
	},
	didInsertElement: function() {
		this._super(...arguments);
		this.$()
			// this event handles setting the focus class
			.on('focusin.${this.elementId}', '.multi-select-input-item', this._focusIn.bind(this))
			// these two events handle keyboard navigation for existing
			// data and triggering editing
			.on('keydown.${this.elementId}', '.multi-select-input-item:not(input)',
				this._suppressBack.bind(this))
			.on('keyup.${this.elementId}', '.multi-select-input-item:not(input)',
				this._handleNonInputKeyUp.bind(this))
			.on('dblclick.${this.elementId}', '.multi-select-input-item:not(input)',
				this._startEditing.bind(this))
			// notify that we are starting creating or updating
			.on('focusin.${this.elementId}', 'input', this._inputStart.bind(this));
		this.get('inputObj').on('focusin.${this.elementId}', function(event) {
			this.setProperties({
				'publicAPI.isCreating': true,
				'publicAPI.currentVal': this.$(event.target).val()
			});
		}.bind(this)).on('focusout.${this.elementId}', function() {
			this.set('publicAPI.isCreating', false);
		}.bind(this));
	},
	willDestroyElement: function() {
		this._super(...arguments);
		this.get('inputObj').off(`.${this.elementId}`);
		this.$().off(`.${this.elementId}`);
	},
	focusOut: function() {
		// any time this element or any of its children lose focus,
		// remove all focus classes for a clean slate
		this.$().removeClass('focus');
		this._findFocusedNode().removeClass('focus');
	},
	focusIn: function() {
		this.ensureFocus();
	},

	// Actions
	// -------

	actions: {
		removeViaButton: function(event) {
			const {
				node: $node,
				object
			} = this._getDataFromEvent(event);
			this.remove(object, $node);
		},
		handleUpdateInput: function(event) {
			const {
				node: $node,
				object
			} = this._getDataFromEvent(event),
				$input = Ember.$(event.target),
				inputVal = $input.val(),
				isEmpty = Ember.isEmpty(inputVal);
			this.set('publicAPI.currentVal', inputVal);
			// set restore flag to true because the only time we don't
			// want to restore the original value is when the update
			// goes through successfully
			this._shouldRestoreOriginal = true;
			if (event.which === 13 || event.which === 27) { // enter, escape
				this.update(object, $input, $node, event);
			} else if ((event.which === 8 || event.which === 46) && isEmpty) { // backspace, delete
				this.remove(object, $node);
			} else {
				this._inputChange(inputVal, event);
			}
		},
		handleNewInput: function(event) {
			const $input = this.get('inputObj'),
				inputVal = $input.val(),
				isEmpty = Ember.isEmpty(inputVal),
				isBlank = Ember.isBlank(inputVal),
				anyData = this.get('anyData');
			this.set('publicAPI.currentVal', inputVal);
			if (event.which === 13 && !isEmpty) { // enter
				this.insert(event);
			} else if (event.which === 27) { // escape
				this.clearInput($input);
			} else if (event.which === 8 && isEmpty && anyData &&
				Ember.isEmpty(this.get('_lastInputValue'))) { // backspace
				const $prev = this._getPrevItem($input),
					prevObj = this._getObjectFromNode($prev);
				this.remove(prevObj, $prev);
			} else if (event.which === 37 && (isEmpty || isBlank) && anyData) { // left arrow and empty
				if (isBlank) {
					this.clearInput($input);
				}
				this._focusBefore();
			} else {
				this._inputChange(inputVal, event);
			}
		}
	},

	// Hook handlers
	// -------------

	insert: function(event) {
		const $input = this.get('inputObj'),
			result = callIfPresent(this.get('onInsert'), $input.val(), event);
		if (result && result.then) {
			result.then(() => {
				this.clearInput($input);
			});
		}
	},
	update: function(object, $input, $node, event) {
		const inputVal = $input.val(),
			isEmpty = Ember.isEmpty(inputVal);
		if (isEmpty || inputVal === this.get('_originalBeforeEdits')) {
			this._stopEditing($input, $node);
		} else {
			const result = callIfPresent(this.get('onUpdate'), object, $input.val(), event);
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
	remove: function(object, $node) {
		if (object) { // ignore if only the input field remaining
			// run next to allow click out to close handler to run first
			Ember.run.next(this, function() {
				const $next = this._getNextItem($node);
				callIfPresent(this.get('onRemove'), object);
				Ember.run.scheduleOnce('afterRender', this, function() {
					this.resetEditing();
					$next.focus();
					// for edge case when multiple data are removed
					this.ensureFocus();
				});
			});
		}
	},
	_inputStart: function(event) {
		this.set('_lastInputValue', event.target.value);
		callIfPresent(this.get('onInputStart'), event.target.value, event);
	},
	_inputChange: function(inputVal, event) {
		if (this.get('_lastInputValue') !== inputVal) {
			callIfPresent(this.get('onInput'), inputVal, event);
		}
		this.set('_lastInputValue', inputVal);
	},
	clearInput: function($input) {
		$input.val('');
		this.set('publicAPI.currentVal', '');
	},

	// Keyboard navigation
	// -------------------

	_suppressBack: function(event) {
		const creating = this.get('publicAPI.isCreating'),
			editing = this.get('publicAPI.isEditing');
		// stop default behavior on backspace which is to go back a page
		if (!creating && !editing && event.which === 8) {
			event.preventDefault();
		}
	},
	_handleNonInputKeyUp: function(event) {
		if (!this.get('publicAPI.isEditing')) {
			if (event.which === 13) { //start editing on enter
				this._startEditing(event);
			} else if (event.which === 39) { // right arrow
				this._focusAfter();
			} else if (event.which === 37) { // left arrow
				this._focusBefore();
			} else if (event.which === 8 || event.which === 46) { // backspace, delete
				const {
					node: $node,
					object
				} = this._getDataFromEvent(event);
				this.remove(object, $node);
			}
		}
	},
	_focusIn: function(event) {
		const $el = this.$();
		$el.addClass('focus');
		this._getDataFromEvent(event).node.addClass('focus');
	},
	_startEditing: function(event) {
		const {
			node: $node,
			object
		} = this._getDataFromEvent(event),
			$edit = $node.find('input.edit-multi-select-input-item'),
			original = $edit.val();
		this.resetEditing();
		$node.addClass('editing');
		this.setProperties({
			'publicAPI.currentlyEditing': object,
			'publicAPI.isEditing': true,
			_$editingInput: $edit,
			_originalBeforeEdits: original,
			_shouldRestoreOriginal: false
		});
		Ember.run.scheduleOnce('afterRender', this, function() {
			$edit.focus();
			if (this.get('autoCloseEdit')) {
				$edit.on('focusout', function() {
					this.resetEditing();
					$edit.off('focusout'); //remove this handler
				}.bind(this));
			}
		});
	},
	_stopEditing: function($edit, $node) {
		this.resetEditing();
		Ember.run.scheduleOnce('afterRender', this, function() {
			$node.focus();
		});
	},
	resetEditing: function() {
		if (this.isDestroying) {
			return;
		}
		this.$().children('.multi-select-input-item').removeClass('editing');
		if (this.get('_shouldRestoreOriginal')) {
			this.get('_$editingInput').val(this.get('_originalBeforeEdits'));
		}
		this.setProperties({
			'publicAPI.currentlyEditing': null,
			'publicAPI.isEditing': false,
			_$editingInput: null,
			_originalBeforeEdits: null,
			_shouldRestoreOriginal: false
		});
	},

	// Focus methods
	// -------------

	ensureFocus: function() {
		// if none of the tag items are selected, select the input object
		if (!this._findFocusedNode().length) {
			this.get('inputObj').focus();
		}
	},
	_focusBefore: function() {
		const $prev = this._getPrevItem(this._findFocusedNode());
		if ($prev && $prev.length) {
			$prev.focus();
		}
	},
	_focusAfter: function() {
		const $next = this._getNextItem(this._findFocusedNode());
		if ($next && $next.length) {
			$next.focus();
		}
	},
	_findFocusedNode: function() {
		return this.$().children('.multi-select-input-item.focus');
	},

	// Helper methods
	// --------------

	_getPrevItem: function($node) {
		return $node.prev('.multi-select-input-item');
	},
	_getNextItem: function($node) {
		return $node.next('.multi-select-input-item');
	},
	_getObjectFromNode: function($node) {
		const arrayIndex = $node.attr('data-index');
		return this.get('data')[arrayIndex];
	},
	_getDataFromEvent: function(event) {
		const $target = Ember.$(event.target),
			$node = $target.hasClass('multi-select-input-item') ? $target : $target.closest(".multi-select-input-item");
		return {
			node: $node,
			object: this._getObjectFromNode($node)
		};
	}
});
