import Ember from 'ember';
import { isDownloadingSupported } from 'textup-frontend/utils/file';

export function canDownload([service, fnName]) {
  return isDownloadingSupported();
}

export default Ember.Helper.helper(canDownload);
