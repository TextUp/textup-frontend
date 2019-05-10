import ArrayUtils from 'textup-frontend/utils/array';
import Ember from 'ember';

const { isArray, isPresent, typeOf } = Ember;

export const ERRORS_PROP_NAME = 'errors';
export const STATUS_PROP_NAME = 'statusCode';
export const MESSAGE_PROP_NAME = 'message';

export function normalizeErrorObject(obj) {
  if (isPossibleError(obj)) {
    if (isResponse(obj)) {
      return {
        [ERRORS_PROP_NAME]: ArrayUtils.ensureAllDefined(
          obj[ERRORS_PROP_NAME].map(normalizeIndividualError)
        ),
      };
    } else if (isPossibleError(obj.responseJSON)) {
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
  return isPossibleError(obj) && isArray(obj[ERRORS_PROP_NAME]);
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

function isPossibleError(obj) {
  return isPresent(obj) && (typeOf(obj) === 'object' || typeOf(obj) === 'error');
}

function normalizeIndividualError(error) {
  // [NOTE] the first choices here are the backend's preferred format. The secondary choices
  // are what Ember/jQuery build as an error object in cases when the backend renders only a status
  // [NOTE] allow empty message because our first priority is getting the status
  // [NOTE] status can `0` for the non-standard time-out state
  const status = parseInt(error[STATUS_PROP_NAME] != null ? error[STATUS_PROP_NAME] : error.status),
    message = error[MESSAGE_PROP_NAME] || error.detail || error.title;
  if (typeOf(status) === 'number' && !isNaN(status)) {
    return { [STATUS_PROP_NAME]: status, [MESSAGE_PROP_NAME]: message };
  }
}
