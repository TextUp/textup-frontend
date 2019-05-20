import { helper as buildHelper } from '@ember/component/helper';
import { isDownloadingSupported } from 'textup-frontend/utils/file';

export function canDownload() {
  return isDownloadingSupported();
}

export default buildHelper(canDownload);
