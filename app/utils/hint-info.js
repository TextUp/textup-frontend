import HintData from 'textup-frontend/data/hint-data';

export function getTitle(hintId) {
  return HintData.hasOwnProperty(hintId) ? HintData[hintId].title : 'Error';
}

export function getMessage(hintId) {
  return HintData.hasOwnProperty(hintId) ? HintData[hintId].message : '';
}
