import Ember from 'ember';
import config from 'textup-frontend/config/environment';

const { $ } = Ember;

export function initialize(/* appInstance */) {
  if (config.hasCordova) {
    document.addEventListener('deviceready', onDeviceReady, false);
  }

  function onDeviceReady() {
    window.open = cordova.InAppBrowser.open;

    $(document).on('click', 'a[target="_system"],a[target="_blank"]', function(e) {
      e.preventDefault();
      var url = this.href;
      cordova.InAppBrowser.open(
        url,
        '_blank',
        'footer=yes,closebuttoncolor=#28a6de,location=no,navigationbuttoncolor=#28a6de'
      );
    });
  }
}

export default {
  name: 'link-intercept',
  initialize,
};
