import { isPresent, typeOf } from '@ember/utils';
import { get } from '@ember/object';
import Constants from 'textup-frontend/constants';

// Can't get access to the Transition class declaration so cannot use `detect`
export function isTransition(obj) {
  return (
    typeOf(obj) === 'object' &&
    typeOf(obj.abort) === 'function' &&
    typeOf(obj.targetName) === 'string'
  );
}

export function isAnyModel(obj) {
  return typeOf(obj) === 'instance' && isPresent(get(obj, Constants.PROP_NAME.MODEL_NAME));
}

export function isOrg(obj) {
  return checkModelName(obj, Constants.MODEL.ORG);
}

export function isTeam(obj) {
  return checkModelName(obj, Constants.MODEL.TEAM);
}

export function isStaff(obj) {
  return checkModelName(obj, Constants.MODEL.STAFF);
}

export function isPhone(obj) {
  return checkModelName(obj, Constants.MODEL.PHONE);
}

export function isTag(obj) {
  return checkModelName(obj, Constants.MODEL.TAG);
}

export function isContact(obj) {
  return checkModelName(obj, Constants.MODEL.CONTACT);
}

export function isText(obj) {
  return checkModelName(obj, Constants.MODEL.RECORD_TEXT);
}

export function isCall(obj) {
  return checkModelName(obj, Constants.MODEL.RECORD_CALL);
}

export function isNote(obj) {
  return checkModelName(obj, Constants.MODEL.RECORD_NOTE);
}

export function isSchedule(obj) {
  return checkModelName(obj, Constants.MODEL.SCHEDULE);
}

function checkModelName(obj, modelName) {
  return isAnyModel(obj) && get(obj, Constants.PROP_NAME.MODEL_NAME) === modelName;
}
