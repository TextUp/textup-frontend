// import CookieConsent to load the library
import CookieConsent from 'npm:cookieconsent'; // jshint ignore:line
import Ember from 'ember';
import HasAppRoot from 'textup-frontend/mixins/component/has-app-root';
import LocaleUtils from 'textup-frontend/utils/locale';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { run } = Ember;

export default Ember.Component.extend(PropTypesMixin, HasAppRoot, {
  propTypes: {
    theme: PropTypes.string,
    learnMoreLink: PropTypes.string
  },
  getDefaultProps() {
    return { theme: 'cookie-consent', learnMoreLink: 'https://cookiesandyou.com/' };
  },

  didInsertElement() {
    run.scheduleOnce('afterRender', this._initCookieConsent.bind(this));
  },

  // Internal handlers
  // -----------------

  // cookieconsent is not exported and instead always added as an property on `window`
  _initCookieConsent() {
    window.cookieconsent.initialise({
      container: this.get('_root'),
      content: { href: this.get('learnMoreLink') },
      theme: this.get('theme'),
      law: { countryCode: LocaleUtils.getCountryCode() }
    });
  }
});
