import config from 'textup-frontend/config/environment';

export const PLATFORM_IOS = 'iOS';
export const PLATFORM_ANDROID = 'Android';

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
