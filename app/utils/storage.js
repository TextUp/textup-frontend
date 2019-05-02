import TypeUtils from 'textup-frontend/utils/type';

// [NOTE] More secure to use userId rather than username so we don't leak account usernames

export const TRUE = 'true';
export const FALSE = 'false';
export const NO_AUTH_USER_ERROR_MSG = 'You must pass in the logged-in user to generate this key.';

export function showManagerKey(authUser) {
  if (TypeUtils.isStaff(authUser)) {
    return `textup-task-manager-${authUser.get('id')}-should-show`;
  } else {
    throwMissingInputError();
  }
}

export function taskKey(authUser, taskId) {
  if (TypeUtils.isStaff(authUser)) {
    return `textup-task-manager-${authUser.get('id')}-finished-${taskId}`;
  } else {
    throwMissingInputError();
  }
}

export function tourKey(authUser) {
  if (TypeUtils.isStaff(authUser)) {
    return `textup-tour-manager-${authUser.get('id')}-finished-tour`;
  } else {
    throwMissingInputError();
  }
}

export function skipSetupKey(authUser) {
  if (TypeUtils.isStaff(authUser)) {
    return `textup-${authUser.get('id')}-skipped-setup`;
  } else {
    throwMissingInputError();
  }
}

export function setupInProgressPhoneNumberKey(authUser) {
  if (TypeUtils.isStaff(authUser)) {
    return `textup-setting-up-${authUser.get('id')}-in-progress-phone-number`;
  } else {
    throwMissingInputError();
  }
}

export function numAttemptsKey() {
  return 'textup-lock-num-attempts';
}

export function currentUrlKey() {
  return 'textup-current-url';
}

export function throwMissingInputError() {
  throw new Error('NO_AUTH_USER_ERROR_MSG');
}
