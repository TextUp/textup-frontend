import Ember from 'ember';
import FileSaver from 'npm:file-saver';

export function isDownloadingSupported() {
  // use the getter syntax to enable mocking during testing
  return !!HTMLAnchorElement.prototype.download;
}

export function tryGetFileNameFromXHR(xhr, fallbackName) {
  const headerVal = xhr.getResponseHeader('Content-Disposition') || '';
  return headerVal.split('filename=')[1] || fallbackName;
}

export function download(arrayBuffer, contentType, fileName) {
  var newBlob = new Blob([arrayBuffer], { type: contentType });
  FileSaver.saveAs(newBlob, fileName);
}
