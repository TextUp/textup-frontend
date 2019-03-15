import TourData from 'textup-frontend/data/tour-data';

export function getTitle(stepId) {
  return TourData.hasOwnProperty(stepId) ? TourData[stepId].title : 'Error';
}

export function getText(stepId) {
  return TourData.hasOwnProperty(stepId) ? TourData[stepId].text : '';
}

export function getStepNumber(stepId) {
  return TourData.hasOwnProperty(stepId) ? TourData[stepId].stepNumber : 0;
}
