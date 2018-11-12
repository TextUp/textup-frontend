import Ember from 'ember';
import { isRecordingSupported } from 'textup-frontend/utils/audio';

export function canRecordAudio() {
  return isRecordingSupported();
}

export default Ember.Helper.helper(canRecordAudio);
