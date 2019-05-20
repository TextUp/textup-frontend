import { readOnly } from '@ember/object/computed';
import $ from 'jquery';
import Service from '@ember/service';
import { run } from '@ember/runloop';

export const SPLASH_SCREEN_ID = 'textup-splash-screen';

export default Service.extend({
  hasSplashScreen: readOnly('_hasSplashScreen'),

  tryRemove() {
    run.join(() => {
      if (this.get('_hasSplashScreen')) {
        run.scheduleOnce('afterRender', this, this._removeSplashScreen);
      }
    });
  },

  // Internal
  // --------

  _hasSplashScreen: true,

  _removeSplashScreen() {
    // fine to re-fetch each time since this method should only be called once
    const $splash = $('#' + SPLASH_SCREEN_ID);
    $splash.fadeOut('fast', () => {
      run.join(() => {
        $splash.remove();
        this.set('_hasSplashScreen', false);
      });
    });
  },
});
