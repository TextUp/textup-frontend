import config from 'textup-frontend/config/environment';
import Ember from 'ember';

export const PLATFORM_IOS = 'iOS';
export const PLATFORM_ANDROID = 'Android';
// this is the desktop breakpoint so anything less than this is considered "mobile"
export const PLATFORM_MOBILE_MAX_WIDTH_IN_PX = 980;

export function isIOS() {
  if (config.hasCordova) {
    return window.device.platform === PLATFORM_IOS;
  } else {
    return false;
  }
}

export function isAndroid() {
  if (config.hasCordova) {
    return window.device.platform === PLATFORM_ANDROID;
  } else {
    return false;
  }
}

export function isMobile() {
  return Ember.$(window).innerWidth() < PLATFORM_MOBILE_MAX_WIDTH_IN_PX;
}

// enabled if (1) manifest generation is enabled, (2) not a native app, (3) appCache is available
export function isAppCacheCapable() {
  return !!(
    config.manifest &&
    config.manifest.enabled &&
    !config.hasCordova &&
    window.applicationCache
  );
}

// [UNTESTED] Cannot test this because we can't mock `window.location`
export function tryReloadWindow() {
  if (window && window.location && window.location.reload) {
    window.location.reload();
  }
}
