import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { inject as service } from '@ember/service';
import { tryInvoke, isPresent } from '@ember/utils';

export default Component.extend(PropTypesMixin, {
  captchaService: service(),

  propTypes: Object.freeze({
    onSuccess: PropTypes.func,
    onFailure: PropTypes.func,
    onExpiration: PropTypes.func,
  }),
  tagName: '',

  // Internal properties
  // -------------------

  _captchaComponent: null,

  // Internal handlers
  // -----------------

  _startVerifyCaptcha(captchaKey) {
    this.get('captchaService')
      .isValid(captchaKey)
      .then(() => tryInvoke(this, 'onSuccess'), () => tryInvoke(this, 'onFailure'));
  },
  _expireCaptcha() {
    const captchaComponent = this.get('_captchaComponent');
    if (isPresent(captchaComponent)) {
      captchaComponent.resetReCaptcha.call(captchaComponent);
    }
    tryInvoke(this, 'onExpiration');
  },
});
