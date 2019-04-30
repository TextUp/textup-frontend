import HintData from 'textup-frontend/data/hint-data';

export const ERROR_TITLE = 'Hint';

export function getTitle(hintId) {
  return HintData.hasOwnProperty(hintId) ? HintData[hintId].title : ERROR_TITLE;
}

export function getMessage(hintId) {
  return HintData.hasOwnProperty(hintId) ? HintData[hintId].message : '';
}
