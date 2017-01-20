import Ember from 'ember';
import defaultIfAbsent from '../utils/default-if-absent';

Ember.TextField.reopen({

    allowShowPassword: defaultIfAbsent(false),

    showPasswordToggleClass: 'show-password-toggle',
    showPasswordToggleBodyClass: 'fa fa-eye',
    showPasswordContainerClass: '',

    // Internal properties
    // -------------------

    $toggle: null,

    // Events
    // ------

    didInsertElement: function() {
        this._super(...arguments);

        Ember.run.scheduleOnce('afterRender', this, function() {
            const $this = this.$(),
                allowShow = this.get('allowShowPassword');
            if ($this.attr('type') === 'password' && allowShow) {
                const $el = this.$(),
                    $container = this._build$Container(),
                    $toggle = this._build$Toggle(),
                    elId = this.elementId,
                    doShow = this.showPassword.bind(this, $el),
                    doHide = this.hidePassword.bind(this, $el);
                // for clean up
                this.set('$toggle', $toggle);
                // wrap element
                $el.before($container);
                $container.append($el, $toggle);
                // bind events to the toggle
                $toggle
                    .on(`mousedown.${elId} touchstart.${elId}`, doShow)
                    .on(`mouseup.${elId} mouseleave.${elId} touchend.${elId}`, doHide);
            }
        });
    },
    willDestroyElement: function() {
        this._super(...arguments);
        const $el = this.$(),
            $toggle = this.get('$toggle');
        $el.off(`.${this.elementId}`);
        // if toggle is present then we need to clean up
        if ($toggle && $toggle.length) {
            $toggle.remove();
            $el.unwrap();
        }

    },

    // DOM construction
    // ----------------

    _build$Toggle: function() {
        const toggleClass = this.get('showPasswordToggleClass'),
            bodyClass = this.get('showPasswordToggleBodyClass');
        return Ember.$(`<div class='${toggleClass}'>
            <span class='${bodyClass}'></span></div>`);
    },
    _build$Container: function() {
        const containerClass = this.get('showPasswordContainerClass');
        return Ember.$(`<div class='${containerClass} show-password-container'></div>`);
    },

    // Visibility methods
    // ------------------

    showPassword: function($input) {
        $input.attr('type', 'text');
    },
    hidePassword: function($input) {
        $input.attr('type', 'password');
    }
});