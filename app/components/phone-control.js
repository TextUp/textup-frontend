import Ember from 'ember';
import defaultIfAbsent from '../utils/default-if-absent';
import callIfPresent from '../utils/call-if-present';
import {
	validate as validateNumber,
	clean as cleanNumber
} from '../utils/phone-number';

const {
	isBlank,
	isNone,
	isPresent,
	computed,
	computed: {
		notEmpty,
	},
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
	tabindex: defaultIfAbsent('-1'),

	onChange: null,
	onClick: null,
	onValidate: null,
	onFocusEnter: null,
	onFocusLeave: null,

	classNames: 'phone-control',
	attributeBindings: ['tabIndex'],

	// Private properties
	// ------------------

	_number: null, // internal copy of the number
	_hasError: false, // true when number is invalid phone number
	_isEditingInput: false,

	_isValidating: false,
	_externalValidationCode: null,

	// Computed properties
	// -------------------

	tabIndex: computed('tabindex', function() {
		return this.get('allowChanges') ? this.get('tabindex') : null;
	}),
	someNumberPresent: notEmpty('number'),
	_cleanedOriginal: computed('number', function() {
		return cleanNumber(this.get('number'));
	}),
	allowChanges: computed('onChange', 'forceAllowChanges', function() {
		return !this.get('disabled') &&
			(isPresent(this.get('onChange')) || this.get('forceAllowChanges'));
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
	_$displayList: computed(function() {
		const $i = this.$('.phone-number-display').find('.form-control');
		return [$i.eq(0), $i.eq(1), $i.eq(2)];
	}),
	_$display: computed(function() {
		return this.$('.phone-number-display-overlay');
	}),
	_$input: computed(function() {
		return this.$('.phone-number-input');
	}),
	_$validate: computed(function() {
		return this.$('.phone-number-validate');
	}),
	_valList: computed(function() {
		return [];
	}),

	// Events
	// ------

	didInsertElement: function() {
		const elId = this.elementId;
		this.get('_$el')
			.on(`focusout.${elId}`, this.doStopFocusElement.bind(this))
			.on(`focusin.${elId}`, this.doFocusOnElement.bind(this));
		this.get('_$input')
			.on(`keyup.${elId}`, this.handleKeyUpForInput.bind(this))
			.on(`paste.${elId}`, this.handlePasteForInput.bind(this))
			.on(`focusout.${elId}`, this.checkErrorForInput.bind(this))
			.on(`focusout.${elId}`, this.handleFocusLeaveForInput.bind(this))
			.on(`focusin.${elId}`, this.handleFocusEnterForInput.bind(this));
		// to support tap-to-edit on touch devices
		this.get('_$display')
			.on(`touchend.${elId}`, this.doFocusOnInput.bind(this));
		// start displaying number
		scheduleOnce('afterRender', this, this.displayNumber);
	},
	willDestroyElement: function() {
		const ns = `.${this.elementId}`;
		this.get('_$el').off(ns);
		this.get('_$input').off(ns);
		this.get('_$display').off(ns);
	},
	didUpdateAttrs: function() {
		scheduleOnce('afterRender', this, this.displayNumber);
	},

	// Event handlers
	// --------------

	handleFocusEnterForInput: function() {
		const number = this.get('_number');
		callIfPresent(this.get('onFocusEnter'), number, !this.get('_hasError'));
	},
	handleFocusLeaveForInput: function() {
		const number = this.get('_number');
		callIfPresent(this.get('onFocusLeave'), number, !this.get('_hasError'));
	},
	handlePasteForInput: function(event) {
		// need to schedule next because when the paste event fires on iOS safari,
		// the value of the input field has not yet been updated
		next(this, function(event) {
			this._handleValueChangeForInput(event);
			scheduleOnce('actions', this, this.checkErrorForInput);
		}, event);
	},
	handleKeyUpForInput: function(event) {
		if (event.which === 13) { // enter on input -> submit
			this._trySubmitForInput();
		} else {
			this._handleValueChangeForInput(event);
			scheduleOnce('actions', this, this.checkErrorForInput);
		}
	},
	checkErrorForInput: function() {
		const number = this.get('_number'),
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

	// Actions
	// -------

	actions: {
		submitInput: function() {
			this._trySubmitForInput();
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

	_handleValueChangeForInput: function(event) {
		const newNumber = cleanNumber(event.target.value);
		this.set('_number', newNumber);
		// after value change for and schedule calling hook (if present)
		// in a LATER queue of the runloop (afterRender happens after actions)
		const onChange = this.get('onChange'),
			cleanedOriginal = this.get('_cleanedOriginal');
		if (isPresent(onChange) && cleanedOriginal !== newNumber) {
			scheduleOnce('afterRender', this, onChange, newNumber);
		}
	},
	_trySubmitForInput: function() {
		const onClick = this.get('onClick'),
			onValidate = this.get('onValidate'),
			number = this.get('_number');
		if (this.get('_hasError') || isBlank(number)) {
			return;
		}
		this.set('_isEditingInput', false);
		callIfPresent(onClick, number, true);
		// move onto validate if present
		if (isPresent(onValidate)) {
			this.set('_isValidating', true);
			next(this, this.tryFocusOnValidate);
		}
	},

	// Phone number display
	// --------------------

	// data down after we sent the 'onChange' event up
	displayNumber: function() {
		const $displayList = this.get('_$displayList'),
			valList = this.get('_valList'),
			cleaned = this.get('_cleanedOriginal');
		valList
			.setObjects([
				cleaned.slice(0, 3),
				cleaned.slice(3, 6),
				cleaned.slice(6)
			])
			.forEach((val, i) => $displayList[i].val(val));
		this.set('_number', cleaned);
		scheduleOnce('actions', this, this.checkErrorForInput);
	},

	// External validation
	// -------------------

	_revertExternalValidation: function(skipFocus = false) {
		this.set('_isValidating', false);
		this.set('_externalValidationCode', '');
		if (!skipFocus) {
			scheduleOnce('afterRender', this, this.tryFocusOnInput);
		}
	},
	_handleSubmitForExternalValidation: function() {
		const code = this.get('_externalValidationCode'),
			onValidate = this.get('onValidate'),
			number = this.get('_number');
		if (isBlank(code)) {
			return;
		}
		// at this point, validation has previously been determined to be present
		const result = onValidate(code, number);
		if (result.then) {
			result.then(this._revertExternalValidation.bind(this));
		}
	},

	// Focus
	// -----

	doStopFocusElement: function(event) {
		const $input = this.get('_$input'),
			// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/relatedTarget
			relTarget = event.relatedTarget; // child element that is gaining focus next
		// if relTarget is null then that means that no child element is gaining focus next
		// if there is a relTarget, then confirm that the input is NOT gaining focus then close
		if (isNone(relTarget) || !$input.is(relTarget)) {
			this.set('_isEditingInput', false);
		}
	},
	doFocusOnElement: function(event) {
		if (!this.get('allowChanges')) {
			return;
		}
		// handle focus at the level of individual input because if we handled here
		// then we will miss the opportunity short circuit a possible infinite loop
		// of focus events triggered by the fact that we are using the focusin event
		// which supports event bubbling up when child elements receive focus too
		if (this.get('_isValidating')) {
			this.tryFocusOnValidate(event);
		} else {
			this.tryFocusOnInput(event);
		}
	},
	tryFocusOnValidate: function(event = undefined) {
		const $validate = this.get('_$validate');
		// see focus on input rationale for this check
		if (isNone(event) || !$validate.is(event.target)) {
			$validate.focus();
		}
	},
	tryFocusOnInput: function(event = undefined) {
		// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/relatedTarget
		const $input = this.get('_$input');
		// event.target is element receiving focus
		// event.relatedTarget is element losing focus
		// we want to focus only when the event target is a parent of this input
		// when the event target is actually the input itself then we know that
		// this is the bubbled up event and if we handled this bubbled up event
		// we would start an infinite loop of focus events
		// ALSO element losing focus (relTarget) must not be the input itself
		// since we don't want to cancel out actions that shift focus away from
		// the input such as tabbing away
		if (isNone(event) || !$input.is(event.target) && !$input.is(event.relatedTarget)) {
			this.doFocusOnInput();
		}
	},
	doFocusOnInput: function() {
		if (!this.get('allowChanges')) {
			return;
		}
		const $input = this.get('_$input');
		this.set('_isEditingInput', true);
		scheduleOnce('afterRender', this, () => $input.focus());
	}
});