import Ember from 'ember';

const { run } = Ember;

// TODO test

export function tryGetFileNameFromXHR(xhr, fallbackName) {
  const headerVal = xhr.getResponseHeader('Content-Disposition') || '';
  return headerVal.split('filename=')[1] || fallbackName;
}

// see: https://blog.jayway.com/2017/07/13/open-pdf-downloaded-api-javascript/
export function download(arrayBuffer, contentType, fileName) {
  var newBlob = new Blob([arrayBuffer], { type: contentType });
  // For Internet Explorer
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(newBlob);
    return;
  }
  // For other browsers: create a link pointing to the ObjectURL containing the blob
  const data = window.URL.createObjectURL(newBlob);
  var link = document.createElement('a');
  link.href = data;
  link.download = fileName;
  link.click();
  // For Firefox it is necessary to delay revoking the ObjectURL
  run.later(() => window.URL.revokeObjectURL(data), 100);
}
