import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { $ } = Ember;

export default {
  name: 'intercept-inappbrowser',
  initialize() {
    if (config.hasCordova) {
      $(document).on('deviceready', onDeviceReady);
    }
  },
};

function onDeviceReady() {
  const brandHexCode = Constants.COLOR.BRAND;
  window.open = window.cordova.InAppBrowser.open;
  $(document).on('click', 'a[target="_system"], a[target="_blank"]', function(e) {
    e.preventDefault();
    window.cordova.InAppBrowser.open(
      this.href,
      '_blank',
      // styling for inappbrowser
      `footer=yes,closebuttoncolor=${brandHexCode},location=no,navigationbuttoncolor=${brandHexCode}`
    );
  });
}
