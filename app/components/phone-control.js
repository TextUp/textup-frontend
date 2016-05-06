import Ember from 'ember';
import defaultIfAbsent from '../utils/default-if-absent';
import callIfPresent from '../utils/call-if-present';
import {
	validate as validateNumber,
	clean as cleanNumber
} from '../utils/phone-number';

export default Ember.Component.extend({
	disabled: defaultIfAbsent(false),
	tabindex: defaultIfAbsent('0'),
	number: defaultIfAbsent(''),
	forceAllowChanges: defaultIfAbsent(false),
	onChange: defaultIfAbsent(null),
	onClick: defaultIfAbsent(null),
	onValidate: defaultIfAbsent(null),
	onFocusEnter: defaultIfAbsent(null),
	onFocusLeave: defaultIfAbsent(null),
	forceDefaultValidate: defaultIfAbsent(false),
	showControl: defaultIfAbsent(false),
	throttleThreshold: defaultIfAbsent(300),

	attributeBindings: ['tabindex:tabIndex'],

	_cleanedAndSplit: null,
	_isValid: true,
	_newNum: '',
	_isValidating: false,
	_validationCode: '',
	_isValidationCodeEmpty: Ember.computed.empty('_validationCode'),

	errorClass: 'form-error',

	// Computed properties
	// -------------------

	tabIndex: Ember.computed('disabled', 'tabindex', function() {
		return this.get('disabled') ? '-1' : this.get('tabindex');
	}),
	someNumberPresent: Ember.computed.notEmpty('number'),
	allowChanges: Ember.computed.or('onChange', 'forceAllowChanges'),
	publicAPI: Ember.computed(function() {
		return {
			actions: {
				back: this._revert.bind(this),
				validate: this._handleValidateAfterEntry.bind(this)
			}
		};
	}),
	$first: Ember.computed(function() {
		return this._get$Input(0);
	}),
	$second: Ember.computed(function() {
		return this._get$Input(1);
	}),
	$third: Ember.computed(function() {
		return this._get$Input(2);
	}),
	_get$Input: function(index) {
		return this.$('.phone-number-input').children('.form-control').eq(index);
	},

	// Events
	// ------

	didInsertElement: function() {
		Ember.run.scheduleOnce('afterRender', this, this._cleanAndSplitNumber);
		const $el = this.$();
		$el.on(`focus.${this.elementId}`, function(event) {
			const $related = Ember.$(event.relatedTarget);
			// only trigger focus on when element that was focused BEFORE
			// is not within this element. By restricting to only external
			// DOM nodes, we prevent situation where we trap the focus in this
			// element since shift+tabbing from inside this element also
			// fires this focus event
			if (!$related.closest($el).length) {
				if (this.get('_isValidating')) {
					this._focusValidate();
				} else {
					this._focusEntry();
				}
			}
		}.bind(this));
		this.$('input, button').on(`focusout.${this.elementId}`, function(event) {
			const $related = event.relatedTarget && Ember.$(event.relatedTarget);
			// only trigger onFocusLeave hook when the related target IS NOT
			// within this component. This condition is fulfilled
			// when the focus is actually leaving this element altogether
			if (!$related || !$related.closest($el).length) {
				const newNum = this._buildNewNumber(),
					isValid = this._validateEntry(newNum);
				callIfPresent(this.get('onFocusLeave'), newNum, isValid);
			}
		}.bind(this));
		this.$('input').on(`focusin.${this.elementId}`, function(event) {
			const $related = event.relatedTarget && Ember.$(event.relatedTarget);
			// only trigger onFocusEnter hook when the related target IS NOT
			// within this component. This condition is fulfilled
			// when the focus is actually leaving this element altogether
			if (!$related || !$related.closest($el).length) {
				const newNum = this._buildNewNumber(),
					isValid = this._validateEntry(newNum);
				callIfPresent(this.get('onFocusEnter'), newNum, isValid);
			}
		}.bind(this));
	},
	willDestroyElement: function() {
		this.$().off(`.${this.elementId}`);
		this.$('input, button').off(`.${this.elementId}`);
		this.$('input').off(`.${this.elementId}`);
	},
	didUpdateAttrs: function() {
		this._cleanAndSplitNumber();
	},

	// Actions
	// -------

	actions: {
		handleLastInput: function() {
			if (this.get('_lastInputDidEnter')) {
				this.set('_lastInputDidEnter', false);
				this.send('clickControl');
			} else {
				this.send('validateInputAndAdjustFocus', 'third');
				// validate input and adjust focus might have changed input
				// so we defer calling the change handler until next loop
				Ember.run.next(this, this._change);
			}
		},
		lastInputDidEnter: function() {
			this.set('_lastInputDidEnter', true);
		},
		handleChange: function() {
			this._change();
		},
		validateInputAndAdjustFocus: function(whichField) {
			const $input = (whichField === 'first') ?
				this.get('$first') :
				((whichField === 'second') ?
					this.get('$second') :
					this.get('$third')),
				val = this._cleanAndUpdateField($input);
			if (whichField === 'first') {
				this.adjustFirstFocus(val);
			} else if (whichField === 'second') {
				this.adjustSecondFocus(val);
			} else {
				this.adjustThirdFocus(val);
			}
		},
		clickControl: function() {
			if (!this.get('_isValid')) {
				return;
			}
			const onClick = this.get('onClick'),
				onValidate = this.get('onValidate'),
				newNum = this.get('_newNum'),
				isValid = this.get('_isValid');
			callIfPresent(onClick, newNum, isValid);
			if (onValidate) {
				this.set('_isValidating', true);
			}
			// decide on if we need to focus for the next step.
			if (onClick && !onValidate) {
				Ember.run.next(this, this._focusEntry);
			} else if (onValidate) {
				Ember.run.next(this, this._focusValidate);
			}
		},
		revert: function() {
			this._revert();
		},
		handleValidate: function() {
			this._handleValidateAfterEntry();
		}
	},

	// Auto change focus
	// -----------------

	adjustFirstFocus: function(val) {
		const numChars = val.length;
		if (numChars === 3) {
			this.get('$second').focus();
		} else if (numChars > 3) {
			this.get('$first').val(val.slice(0, 3));
			this.get('$second').val(val.slice(3)).focus();
		}
	},
	adjustSecondFocus: function(val) {
		const numChars = val.length;
		if (numChars === 0) {
			this.get('$first').focus();
		} else if (numChars === 3) {
			this.get('$third').focus();
		} else if (numChars > 3) {
			this.get('$second').val(val.slice(0, 3));
			this.get('$third').val(val.slice(3)).focus();
		}
	},
	adjustThirdFocus: function(val) {
		const numChars = val.length;
		if (numChars === 0) {
			this.get('$second').focus();
		} else if (numChars > 4) {
			this.get('$third').val(val.slice(0, 4));
		}
	},

	// Focus
	// -----

	_focusEntry: function() {
		const $el = this.$();
		if ($el) {
			const cleanedAndSplit = this.get('_cleanedAndSplit');
			if (cleanedAndSplit.second.length === 3) {
				this.get('$third').focus();
			} else if (cleanedAndSplit.first.length === 3) {
				this.get('$second').focus();
			} else {
				this.get('$first').focus();
			}
		}
	},
	_focusValidate: function() {
		const $el = this.$();
		if ($el) {
			const validateControl = $el.find('.phone-number-validate');
			if (validateControl) {
				validateControl.focus();
			}
		}
	},

	// Change
	// ------

	_change: function() {
		const newNum = this._buildNewNumber(),
			isValid = this._validateEntry(newNum),
			onChange = this.get('onChange'),
			throttle = this.get('throttleThreshold'),
			$el = this.$(),
			errorClass = this.get('errorClass');
		if (onChange) {
			Ember.run.throttle(this, onChange, newNum, isValid, throttle);
		}
		if (isValid) {
			$el.removeClass(errorClass);
		} else {
			$el.addClass(errorClass);
		}
		if (Ember.isBlank(newNum)) { // should not error class when no input
			$el.removeClass(errorClass);
		}
		if (!this.isDestroying && !this.isDestroyed) {
			this.set('_newNum', newNum);
		}
		return newNum;
	},

	// Validation
	// ----------

	_revert: function(skipFocus) {
		this.set('_isValidating', false);
		this.set('_validationCode', '');
		if (!skipFocus) {
			Ember.run.scheduleOnce('afterRender', this, this._focusEntry);
		}
	},
	_handleValidateAfterEntry: function() {
		const code = this.get('_validationCode'),
			onValidate = this.get('onValidate'),
			newNum = this.get('_newNum');
		if (!code) {
			return;
		}
		const result = onValidate(code, newNum);
		if (result.then) {
			result.then(() => {
				this._revert();
			});
		}
	},

	// Process number
	// --------------

	_cleanAndSplitNumber: function() {
		const number = this.get('number');
		// only validate if number is not blank
		if (!Ember.isBlank(number) && !this._validateEntry(number)) {
			this._revert(true);
		}
		const cleaned = cleanNumber(number);
		this.set('_cleanedAndSplit', {
			first: cleaned.slice(0, 3),
			second: cleaned.slice(3, 6),
			third: cleaned.slice(6)
		});
	},
	_cleanAndUpdateField: function($input) {
		const rawVal = $input.val(),
			cleanedVal = cleanNumber(rawVal);
		if (rawVal !== cleanedVal) {
			$input.val(cleanedVal);
		}
		return cleanedVal;
	},
	_buildNewNumber: function() {
		const $first = this.get('$first'),
			$second = this.get('$second'),
			$third = this.get('$third');
		return ($first.val() || '   ') + ($second.val() || '   ') + $third.val();
	},
	_validateEntry: function(number) {
		const isValid = validateNumber(number);
		this.set('_isValid', isValid);
		return isValid;
	}
});
