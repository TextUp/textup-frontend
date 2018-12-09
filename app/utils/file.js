import FileSaver from 'npm:file-saver';

// [UNTESTED] because of Illegal invocation when accessing prototype objects
export function isDownloadingSupported() {
  return 'download' in HTMLAnchorElement.prototype;
}

export function tryGetFileNameFromXHR(xhr, fallbackName) {
  const headerVal = xhr.getResponseHeader('Content-Disposition') || '';
  return headerVal.split('filename=')[1] || fallbackName;
}

export function download(arrayBuffer, contentType, fileName) {
  var newBlob = new Blob([arrayBuffer], { type: contentType });
  FileSaver.saveAs(newBlob, fileName);
}
