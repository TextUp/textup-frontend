import ArrayUtils from 'textup-frontend/utils/array';
import Ember from 'ember';

const { isArray, isPresent, typeOf } = Ember;

export const ERRORS_PROP_NAME = 'errors';
export const STATUS_PROP_NAME = 'statusCode';
export const MESSAGE_PROP_NAME = 'message';

export function normalizeErrorObject(obj) {
  if (isObject(obj)) {
    if (isResponse(obj)) {
      return obj;
    } else if (isObject(obj.responseJSON)) {
      return obj.responseJSON;
    } else if (typeOf(obj.status) === 'number') {
      return {
        [ERRORS_PROP_NAME]: [
          { [STATUS_PROP_NAME]: obj.status, [MESSAGE_PROP_NAME]: obj.statusText },
        ],
      };
    }
  }
  return obj;
}

export function isResponse(obj) {
  return isObject(obj) && isArray(obj[ERRORS_PROP_NAME]);
}

export function isResponseStatus(obj, statusCode) {
  if (isResponse(obj)) {
    return ArrayUtils.ensureAllDefined(obj[ERRORS_PROP_NAME]).isAny(STATUS_PROP_NAME, statusCode);
  } else {
    return false;
  }
}

export function tryExtractResponseMessages(obj) {
  if (isResponse(obj)) {
    return ArrayUtils.ensureAllDefined(obj[ERRORS_PROP_NAME])
      .mapBy(MESSAGE_PROP_NAME)
      .filter(isPresent)
      .uniq();
  } else {
    return [];
  }
}

function isObject(obj) {
  return isPresent(obj) && typeOf(obj) === 'object';
}
