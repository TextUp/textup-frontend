import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { typeOf, isPresent, get } = Ember;

export function isAnyModel(obj) {
  return typeOf(obj) === 'instance' && isPresent(get(obj, Constants.PROP_NAME.MODEL_NAME));
}

export function isOrg(obj) {
  return isAnyModel(obj) && get(obj, Constants.PROP_NAME.MODEL_NAME) === Constants.MODEL.ORG;
}

export function isTeam(obj) {
  return isAnyModel(obj) && get(obj, Constants.PROP_NAME.MODEL_NAME) === Constants.MODEL.TEAM;
}

export function isStaff(obj) {
  return isAnyModel(obj) && get(obj, Constants.PROP_NAME.MODEL_NAME) === Constants.MODEL.STAFF;
}

export function isTag(obj) {
  return isAnyModel(obj) && get(obj, Constants.PROP_NAME.MODEL_NAME) === Constants.MODEL.TAG;
}

export function isContact(obj) {
  return isAnyModel(obj) && get(obj, Constants.PROP_NAME.MODEL_NAME) === Constants.MODEL.CONTACT;
}

export function isText(obj) {
  return (
    isAnyModel(obj) && get(obj, Constants.PROP_NAME.MODEL_NAME) === Constants.MODEL.RECORD_TEXT
  );
}

export function isCall(obj) {
  return (
    isAnyModel(obj) && get(obj, Constants.PROP_NAME.MODEL_NAME) === Constants.MODEL.RECORD_CALL
  );
}

export function isNote(obj) {
  return (
    isAnyModel(obj) && get(obj, Constants.PROP_NAME.MODEL_NAME) === Constants.MODEL.RECORD_NOTE
  );
}
