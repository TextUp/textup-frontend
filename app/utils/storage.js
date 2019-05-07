import TypeUtils from 'textup-frontend/utils/type';

// [NOTE] More secure to use userId rather than username so we don't leak account usernames

export const TRUE = 'true';
export const FALSE = 'false';

export function showManagerKey(authUser) {
  if (TypeUtils.isStaff(authUser)) {
    return `textup-task-manager-${authUser.get('id')}-should-show`;
  }
}

export function taskKey(authUser, taskId) {
  if (TypeUtils.isStaff(authUser)) {
    return `textup-task-manager-${authUser.get('id')}-finished-${taskId}`;
  }
}

export function tourKey(authUser) {
  if (TypeUtils.isStaff(authUser)) {
    return `textup-tour-manager-${authUser.get('id')}-finished-tour`;
  }
}

export function skipSetupKey(authUser) {
  if (TypeUtils.isStaff(authUser)) {
    return `textup-${authUser.get('id')}-skipped-setup`;
  }
}

export function setupInProgressPhoneNumberKey(authUser) {
  if (TypeUtils.isStaff(authUser)) {
    return `textup-setting-up-${authUser.get('id')}-in-progress-phone-number`;
  }
}

export function numAttemptsKey() {
  return 'textup-lock-num-attempts';
}

export function currentUrlKey() {
  return 'textup-current-url';
}

export function authTokenKey() {
  return 'textup-auth-token';
}

export function authRefreshTokenKey() {
  return 'textup-auth-refresh-token';
}

export function authUserIdKey() {
  return 'textup-auth-user-id';
}
