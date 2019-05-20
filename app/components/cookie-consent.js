import Component from '@ember/component';
import CookieConsent from 'cookieconsent'; // eslint-disable-line
import HasAppRoot from 'textup-frontend/mixins/component/has-app-root';
import LocaleUtils from 'textup-frontend/utils/locale';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { run } from '@ember/runloop';

// [NOTE] need to import CookieConsent to load the library into the global namespace

export default Component.extend(PropTypesMixin, HasAppRoot, {
  propTypes: {
    theme: PropTypes.string,
    learnMoreLink: PropTypes.string,
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
      law: { countryCode: LocaleUtils.getCountryCode() },
    });
  },
});
