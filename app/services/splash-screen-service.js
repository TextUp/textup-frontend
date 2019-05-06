import Ember from 'ember';

// [NOTE] We use a service rather than a component or an initializer because of timing considerations
// (1) components are loaded and inserted too late so the user sees a white screen before the
// component kicks in, renders the splash screen, then removes it
// (2) initializers are loaded BEFORE the app has initialized so. Because we don't have a reliable
// event or a way to schedule a function to run after the app has been initialized and all
// route transitions completed, we would need to guess at when the loading has finished. Instead
// of ths guesswork, we just use the `didTransition` hook in the `application` route and
// short-circuit if we've already removed the splash screen

const { computed, run } = Ember;

export const SPLASH_SCREEN_ID = 'textup-splash-screen';

export default Ember.Service.extend({
  hasSplashScreen: computed.readOnly('_hasSplashScreen'),

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
    const $splash = Ember.$('#' + SPLASH_SCREEN_ID);
    $splash.fadeOut('fast', () => {
      run.join(() => {
        $splash.remove();
        this.set('_hasSplashScreen', false);
      });
    });
  },
});
