import Ember from 'ember';
import config from 'textup-frontend/config/environment';

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
  window.open = window.cordova.InAppBrowser.open;
  $(document).on('click', 'a[target="_system"], a[target="_blank"]', function(e) {
    e.preventDefault();
    window.cordova.InAppBrowser.open(
      this.href,
      '_blank',
      // styling for inappbrowser
      // TODO: change colors to be constants
      'footer=yes,closebuttoncolor=#28a6de,location=no,navigationbuttoncolor=#28a6de'
    );
  });
}
