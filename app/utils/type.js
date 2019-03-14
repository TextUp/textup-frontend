import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { typeOf, isPresent } = Ember;

export const MODEL_NAME_PROP_NAME = 'constructor.modelName';

export function isAnyModel(obj) {
  return typeOf(obj) === 'instance' && isPresent(obj[MODEL_NAME_PROP_NAME]);
}

export function isOrg(obj) {
  return isAnyModel(obj) && obj[MODEL_NAME_PROP_NAME] === Constants.MODEL.ORG;
}

export function isTeam(obj) {
  return isAnyModel(obj) && obj[MODEL_NAME_PROP_NAME] === Constants.MODEL.TEAM;
}

export function isStaff(obj) {
  return isAnyModel(obj) && obj[MODEL_NAME_PROP_NAME] === Constants.MODEL.STAFF;
}

export function isTag(obj) {
  return isAnyModel(obj) && obj[MODEL_NAME_PROP_NAME] === Constants.MODEL.TAG;
}

export function isContact(obj) {
  return isAnyModel(obj) && obj[MODEL_NAME_PROP_NAME] === Constants.MODEL.CONTACT;
}

export function isText(obj) {
  return isAnyModel(obj) && obj[MODEL_NAME_PROP_NAME] === Constants.MODEL.RECORD_TEXT;
}

export function isCall(obj) {
  return isAnyModel(obj) && obj[MODEL_NAME_PROP_NAME] === Constants.MODEL.RECORD_CALL;
}

export function isNote(obj) {
  return isAnyModel(obj) && obj[MODEL_NAME_PROP_NAME] === Constants.MODEL.RECORD_NOTE;
}
