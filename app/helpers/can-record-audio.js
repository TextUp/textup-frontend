import { helper as buildHelper } from '@ember/component/helper';
import { isRecordingSupported } from 'textup-frontend/utils/audio';

export function canRecordAudio() {
  return isRecordingSupported();
}

export default buildHelper(canRecordAudio);
