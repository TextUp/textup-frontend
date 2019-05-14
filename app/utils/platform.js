import config from 'textup-frontend/config/environment';
import Ember from 'ember';

export const PLATFORM_IOS = 'iOS';
export const PLATFORM_ANDROID = 'Android';
// this is the desktop breakpoint so anything less than this is considered "mobile"
export const PLATFORM_MOBILE_MAX_WIDTH_IN_PX = 980;

export function isIOS() {
  if (config.hasCordova && window.device) {
    return window.device.platform === PLATFORM_IOS;
  } else {
    return false;
  }
}

export function isAndroid() {
  if (config.hasCordova && window.device) {
    return window.device.platform === PLATFORM_ANDROID;
  } else {
    return false;
  }
}

export function isMobile() {
  return Ember.$(window).innerWidth() < PLATFORM_MOBILE_MAX_WIDTH_IN_PX;
}
