import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { isPresent, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  captchaService: Ember.inject.service(),

  propTypes: {
    onSuccess: PropTypes.func,
    onFailure: PropTypes.func,
    onExpiration: PropTypes.func,
  },
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
