import Ember from 'ember';
import defaultIfAbsent from '../utils/default-if-absent';
import callIfPresent from '../utils/call-if-present';
import {
	validate as validateNumber,
	clean as cleanNumber
} from '../utils/phone-number';

const {
	$,
	isBlank,
	isPresent,
	computed,
	computed: {
		notEmpty,
	},
	run,
	run: {
		scheduleOnce,
		next,
	}
} = Ember;

export default Ember.Component.extend({

	disabled: defaultIfAbsent(false),
	number: defaultIfAbsent(''),
	forceAllowChanges: defaultIfAbsent(false),
	forceDefaultValidate: defaultIfAbsent(false),
	showControl: defaultIfAbsent(false),

	controlClass: defaultIfAbsent(''),
	controlButtonClass: defaultIfAbsent(''),
	errorClass: defaultIfAbsent('form-error'),

	onChange: null,
	onClick: null,
	onValidate: null,
	onFocusEnter: null,
	onFocusLeave: null,

	classNames: 'phone-control',

	// Private properties
	// ------------------

	_hasError: false, // true when number is invalid phone number
	_inputIndex: null, // for re-focusing after updating number
	_selectionPosition: null, // for re-focusing after updating number
	_whichKey: null, // for re-focusing after updating number

	_isValidating: false,
	_externalValidationCode: null,

	// Computed properties
	// -------------------

	someNumberPresent: notEmpty('number'),
	_cleanedOriginal: computed('number', function() {
		return cleanNumber(this.get('number'));
	}),
	allowChanges: computed('onChange', 'forceAllowChanges', function() {
		return !this.get('disabled') &&
			(this.get('onChange') || this.get('forceAllowChanges'));
	}),
	publicAPI: computed(function() {
		return {
			actions: {
				back: this._revertExternalValidation.bind(this),
				validate: this._handleValidateAfterEntry.bind(this)
			}
		};
	}),
	_$el: computed(function() {
		return this.$();
	}),
	_$inputContainer: computed(function() {
		return this.$('.phone-number-input');
	}),
	_$inputList: computed(function() {
		const $i = this.$('.phone-number-input').find('.form-control');
		return [$i.eq(0), $i.eq(1), $i.eq(2)];
	}),
	_$validate: computed(function() {
		return this.$().find('.phone-number-validate');
	}),
	_valList: computed(function() {
		return [];
	}),

	// Events
	// ------

	didInsertElement: function() {
		const $inputList = this.get('_$inputList'),
			elId = this.elementId;
		// bind events
		$inputList.forEach(($input, i) => {
			$input
				.on(`focusin.${elId}`, this.handleFocusEnterForInput.bind(this))
				.on(`focusout.${elId}`, this.handleFocusLeaveForInput.bind(this))
				.on(`focusout.${elId}`, this.checkErrorForInput.bind(this))
				.on(`keyup.${elId}`, this.handleKeyUpForInput.bind(this, i))
				.on(`paste.${elId}`, this.handlePasteForInput.bind(this, i));
		});
		// start displaying number
		scheduleOnce('afterRender', this, this.updateNumber);
	},
	willDestroyElement: function() {
		const elId = this.elementId,
			namespace = `.${elId}`;
		this.get('_$inputList').forEach(($input) => $input.off(namespace));
	},
	didUpdateAttrs: function() {
		scheduleOnce('afterRender', this, this.updateNumber);
	},

	// Event handlers
	// --------------

	handlePasteForInput: function(index, event) {
		scheduleOnce('afterRender', this, this.handleKeyUpForInput.bind(this, index, event));
	},
	handleKeyUpForInput: function(index, event) {
		// ignore key input while we are focusing because allowing input
		// may result in the cursor being placed in the wrong position after focusing
		// and confusing the user because they are suddenly typing into the wrong place
		if (this.get('_isFocusing')) {
			return;
		}
		// store values that will be needed for focusing FIRST
		// when we update the number displayed in the 'data down' phase
		const $inputList = this.get('_$inputList'),
			position = $inputList[index][0].selectionStart,
			which = event.which;
		this.setProperties({
			_inputIndex: index,
			_selectionPosition: position,
			_whichKey: which
		});
		if (event.ctrlKey || event.shiftKey) { // modifier keys for text selection
			this.doSelectionForInput(event);
		} else if (which === 13 && index === 2) { // enter on third input, submit
			this._handleSubmitForInput();
		} else if (which === 37) { // left arrow
			this._tryAdjustFocusBackwards(index, position);
		} else if (which === 39) { // right arrow
			this._tryAdjustFocusForwards(index, position);
		} else {
			this._handleValueChangeForInput(index);
			scheduleOnce('actions', this, this.checkErrorForInput);
		}
	},
	checkErrorForInput: function() {
		const number = this._getNumber(this.get('_valList')),
			errorClass = this.get('errorClass'),
			$el = this.get('_$el');
		if (isBlank(number) || validateNumber(number)) {
			this.set('_hasError', false);
			$el.removeClass(errorClass);
		} else {
			this.set('_hasError', true);
			$el.addClass(errorClass);
		}
	},
	handleFocusEnterForInput: function() {
		const number = this._getNumber(this.get('_valList'));
		callIfPresent(this.get('onFocusEnter'), number, !this.get('_hasError'));
	},
	handleFocusLeaveForInput: function() {
		const number = this._getNumber(this.get('_valList'));
		callIfPresent(this.get('onFocusLeave'), number, !this.get('_hasError'));
	},

	// Actions
	// -------

	actions: {
		submitInput: function() {
			this._handleSubmitForInput();
		},
		revertExternalValidation: function() {
			this._revertExternalValidation();
		},
		submitExternalValidation: function() {
			this._handleSubmitForExternalValidation();
		},
	},

	// Phone number input
	// ------------------

	_handleValueChangeForInput: function(index) {
		const $inputList = this.get('_$inputList'),
			valList = this.get('_valList');
		// update values in value list
		valList.replace(index, 1, [$inputList[index].val()]);
		// after value change for and schedule calling hook (if present)
		// in a LATER queue of the runloop (afterRender happens after actions)
		const onChange = this.get('onChange'),
			cleanedOriginal = this.get('_cleanedOriginal'),
			newNumber = cleanNumber(this._getNumber(valList));
		if (isPresent(onChange) && cleanedOriginal !== newNumber) {
			scheduleOnce('afterRender', this, onChange, newNumber);
		}
	},
	_handleSubmitForInput: function() {
		const onClick = this.get('onClick'),
			onValidate = this.get('onValidate'),
			number = this._getNumber(this.get('_valList'));
		if (this.get('_hasError') || isBlank(number)) {
			return;
		}
		callIfPresent(onClick, number);
		// move onto validate if present
		if (isPresent(onValidate)) {
			this.set('_isValidating', true);
			next(this, this.doFocusOnValidate);
		}
	},

	// Updating number
	// ---------------

	// data down after we sent the 'onChange' event up
	updateNumber: function() {
		run(() => {
			// update number in value list
			if (this.get('someNumberPresent') || this.get('allowChanges')) {
				this._displayNumber();
			}
			this._adjustFocusAfterUpdatingNumber();
			this.setProperties({
				_inputIndex: null,
				_selectionPosition: null,
				_whichKey: null
			});
		});
	},
	_displayNumber: function() {
		const $inputList = this.get('_$inputList'),
			valList = this.get('_valList'),
			cleaned = this.get('_cleanedOriginal');
		valList
			.setObjects([
				cleaned.slice(0, 3),
				cleaned.slice(3, 6),
				cleaned.slice(6)
			])
			.forEach((val, i) => $inputList[i].val(val));
	},
	_adjustFocusAfterUpdatingNumber: function() {
		// adjust focus, if needed
		const currentFocus = document.activeElement,
			$el = this.get('_$el');
		// if a DOM element is focused, check that is inside this component
		if (isPresent(currentFocus) && $.contains($el[0], currentFocus)) {
			this.doFocusOnElement();
		}
	},

	// External validation
	// -------------------

	_revertExternalValidation: function(skipFocus = false) {
		this.set('_isValidating', false);
		this.set('_externalValidationCode', '');
		if (!skipFocus) {
			scheduleOnce('afterRender', this, this.doFocusOnInput);
		}
	},
	_handleSubmitForExternalValidation: function() {
		const code = this.get('_externalValidationCode'),
			onValidate = this.get('onValidate'),
			number = this._getNumber(this.get('_valList'));
		if (isBlank(code)) {
			return;
		}
		// at this point, validation has previously been determined to be present
		const result = onValidate(code, number);
		if (result.then) {
			result.then(this._revertExternalValidation.bind(this));
		}
	},

	// Selection
	// ---------

	doSelectionForInput: function(event) {
		const selection = document.getSelection(),
			$inputList = this.get('_$inputList');
		// Ctrl-A to select the entire number
		if (event.which === 65 && event.ctrlKey === true) {
			selection.selectAllChildren(this.get('_$inputContainer')[0]);
		} else if (event.shiftKey === true) {
			const startNode = selection.anchorNode,
				newRange = document.createRange();
			if (event.which === 37) { // LEFT, move focus of selection to beginning
				const endNode = $inputList[0].parent()[0];
				// right to left selection
				newRange.setStart(endNode, 0);
				newRange.setEnd(startNode, startNode.childNodes.length);
				selection.removeAllRanges();
				selection.addRange(newRange);
			} else if (event.which === 39) { // RIGHT, move focus of selection to end
				const endNode = $inputList[2].parent()[0];
				// left to right selection
				newRange.setStart(startNode, 0);
				newRange.setEnd(endNode, endNode.childNodes.length);
				selection.removeAllRanges();
				selection.addRange(newRange);
			}
		}
	},

	// Focus
	// -----

	doFocusOnElement: function() {
		if (this.get('_isValidating')) {
			this.doFocusOnValidate();
		} else {
			this.doFocusOnInput();
		}
	},
	doFocusOnValidate: function() {
		this.get('_$validate').focus();
	},
	doFocusOnInput: function() {

		this.set('_isFocusing', true);

		const index = this.get('_inputIndex'),
			position = this.get('_selectionPosition'),
			which = this.get('_whichKey');
		if ([index, position, which].every(isPresent)) {
			this._doExistingFocusOnInput();
		} else {
			this._doNewFocusOnInput();
		}

		next(this, function() {
			this.set('_isFocusing', false);
		});
	},
	_doNewFocusOnInput: function() {
		const $inputList = this.get('_$inputList'),
			valList = this.get('_valList'),
			firstIncomplete = valList.find((val) => isBlank(val) || val.length < 3),
			incompleteIndex = valList.indexOf(firstIncomplete);
		// if focus is still in the same input, then preserve position
		if (incompleteIndex > -1) {
			$inputList[incompleteIndex].focus();
		} else {
			$inputList[2].focus();
		}
	},
	_doExistingFocusOnInput: function() {
		const index = this.get('_inputIndex'),
			// selection position AFTER key is pressed because from keyup event
			position = this.get('_selectionPosition'),
			which = this.get('_whichKey');
		if (which === 8) { // backspace removing one character
			this._tryAdjustFocusBackwards(index, position);
		} else { // all other keys adding one character
			this._tryAdjustFocusForwards(index, position);
		}
	},
	_tryAdjustFocusBackwards: function(index, position) {
		if (index > 0 && position === 0) {
			const $input = this.get('_$inputList')[index - 1],
				input = $input[0],
				numChar = $input.val().length;
			run(() => {
				$input.focus();
				input.selectionStart = numChar;
				input.selectionEnd = numChar;
			});
		}
	},
	_tryAdjustFocusForwards: function(index, position) {
		if (index < 2 && position > 2) {
			const $input = this.get('_$inputList')[index + 1],
				input = $input[0];
			run(() => {
				$input.focus();
				input.selectionStart = 0;
				input.selectionEnd = 0;
			});
		}
	},

	// Helper methods
	// --------------

	_getNumber: function(valList) {
		return valList.join('');
	},
});