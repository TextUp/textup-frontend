import * as ArrayUtils from 'textup-frontend/utils/array';
import Ember from 'ember';

const { isArray, isPresent, typeOf } = Ember,
  ERRORS_PROP_NAME = 'errors',
  STATUS_PROP_NAME = 'statusCode',
  MESSAGE_PROP_NAME = 'message';

export function isResponse(obj) {
  return isPresent(obj) && isArray(obj[ERRORS_PROP_NAME]);
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
      .uniq();
  } else {
    return [];
  }
}
