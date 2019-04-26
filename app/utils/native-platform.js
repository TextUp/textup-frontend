import config from 'textup-frontend/config/environment';

export function isIOS() {
  if (config.hasCordova){
    return window.device.platform === "iOS";
  } else {
    return false;
  }
}

export function isAndroid() {
  if (config.hasCordova){
    return window.device.platform === "Android";
  } else {
    return false;
  }}
