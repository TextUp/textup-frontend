import Ember from 'ember';
import callIfPresent from '../utils/call-if-present';
import defaultIfAbsent from '../utils/default-if-absent';

const {
    $,
    computed,
    run: {
        scheduleOnce
    }
} = Ember;

export default Ember.Component.extend({

    val: defaultIfAbsent(''),
    numDigits: defaultIfAbsent(false), // if specified, should be a positive integer
    disabled: defaultIfAbsent(false),
    hasError: defaultIfAbsent(false),
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
    classNameBindings: ['disabled:form-disabled', 'hasError:form-error'],
    attributeBindings: ['tabindex:tabIndex'],

    // Computed properties
    // -------------------

    tabIndex: computed('tabindex', function() {
        const ind = this.get('tabindex');
        return (this.get('disabled') || ind === false) ? null : ind;
    }),
    _isFull: computed('numDigits', 'val', function() {
        const numDigits = this.get('numDigits');
        return !!(numDigits && this.get('val.length') === numDigits);
    }),

    // Events
    // ------

    didInsertElement: function() {
        this._super(...arguments);
        const elId = this.elementId,
            events = `click.${elId} touchend.${elId}`;
        this.$(".number-control-item")
            .on(events, this.addFromUserInput.bind(this));
        this.$(".number-control-remove")
            .on(events, this.removeByUserInput.bind(this));
    },
    willDestroyElement: function() {
        this._super(...arguments);
        const elId = this.elementId,
            events = `click.${elId} touchend.${elId}`;
        this.$(".number-control-item").off(events);
        this.$(".number-control-remove").off(events);
    },
    didUpdateAttrs: function() {
        if (this.get('_isFull')) {
            scheduleOnce('afterRender', this, this.handleOnFull);
        }
    },
    keyDown: function(event) {
        // disable going back in history for backspace
        if (!this.get('disabled') && event.which === 8) {
            event.preventDefault();
            return false;
        }
    },
    keyUp: function(event) {
        if (event.which >= 48 && event.which <= 57) { // numeric keys
            this.appendToVal(String.fromCharCode(event.which));
        } else if (event.which === 8) { // backspace
            this.removeLastFromVal();
        } else if (event.which === 13 && this.get('_isFull')) { // enter
            this.handleOnSubmit();
        }
    },

    // Modify value
    // ------------

    addFromUserInput: function(event) {
        const val = $(event.currentTarget).attr("data-value");
        this.appendToVal(val);
        // stop click event from being called if touchend is called first
        event.stopImmediatePropagation();
        return false;
    },
    removeByUserInput: function(event) {
        this.removeLastFromVal();
        // stop click event from being called if touchend is called first
        event.stopImmediatePropagation();
        return false;
    },

    // Hooks
    // -----

    appendToVal: function(char) {
        if (this.get('disabled')) {
            return;
        }
        const numDigits = this.get('numDigits'),
            val = this.get('val');
        if (!numDigits || (numDigits && val.length < numDigits)) {
            callIfPresent(this.get('doChange'), val + char);
        }
    },
    removeLastFromVal: function() {
        if (this.get('disabled')) {
            return;
        }
        callIfPresent(this.get('doChange'), this.get('val').slice(0, -1));
    },
    handleOnFull: function() {
        if (this.get('disabled')) {
            return;
        }
        callIfPresent(this.get('onFull'), this.get('val'));
    },
    handleOnSubmit: function() {
        if (this.get('disabled')) {
            return;
        }
        callIfPresent(this.get('onSubmit'), this.get('val'));
    }
});