import $ from 'jquery';
import { scheduleOnce } from '@ember/runloop';
import TextField from '@ember/component/text-field';
import defaultIfAbsent from 'textup-frontend/utils/default-if-absent';

TextField.reopen({
  allowShowPassword: defaultIfAbsent(false),

  showPasswordToggleClass: 'show-password-toggle',
  showPasswordToggleBodyClass: 'fa fa-eye',
  showPasswordContainerClass: '',

  // Internal properties
  // -------------------

  $toggle: null,

  // Events
  // ------

  didInsertElement() {
    this._super(...arguments);

    scheduleOnce('afterRender', this, function() {
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
  willDestroyElement() {
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

  _build$Toggle() {
    const toggleClass = this.get('showPasswordToggleClass'),
      bodyClass = this.get('showPasswordToggleBodyClass');
    return $(`<div class='${toggleClass}'>
            <span class='${bodyClass}'></span></div>`);
  },
  _build$Container() {
    const containerClass = this.get('showPasswordContainerClass');
    return $(`<div class='${containerClass} show-password-container'></div>`);
  },

  // Visibility methods
  // ------------------

  showPassword($input) {
    $input.attr('type', 'text');
  },
  hidePassword($input) {
    $input.attr('type', 'password');
  },
});
