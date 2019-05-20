import $ from 'jquery';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';

export default {
  name: 'intercept-inappbrowser',
  initialize() {
    if (config.hasCordova) {
      $(document).on('deviceready', onDeviceReady);
    }
  },
};

export function onDeviceReady() {
  // overridden the `open` function with the cordova-specific version
  window.open = window.cordova.InAppBrowser.open;
  $(document).on(
    'click',
    'a[target="_system"], a[target="_blank"]',
    overrideAnchorTagBehavior
  );
}

export function overrideAnchorTagBehavior(event) {
  const brandColor = Constants.COLOR.BRAND;
  event.preventDefault();
  window.cordova.InAppBrowser.open(
    event.target.href,
    '_blank',
    // styling for inappbrowser
    `footer=yes,closebuttoncolor=${brandColor},location=no,navigationbuttoncolor=${brandColor}`
  );
}
