import FileUtils from 'textup-frontend/utils/file';
import FileSaver from 'npm:file-saver';
import sinon from 'sinon';
import { module, test } from 'qunit';

module('Unit | Utility | file');

test('if downloading is supported', function(assert) {
  const getterStub = sinon.stub(),
    downloadPrototypeStub = sinon.stub(HTMLAnchorElement.prototype, 'download').get(getterStub);

  getterStub.returns(true);
  assert.equal(FileUtils.isDownloadingSupported(), true);
  assert.ok(getterStub.calledOnce);

  getterStub.returns(false);
  assert.equal(FileUtils.isDownloadingSupported(), false);
  assert.ok(getterStub.calledTwice);

  downloadPrototypeStub.restore();
});

test('getting file name from xhr response', function(assert) {
  const responseName = `${Math.random()}`,
    fallbackName = `${Math.random()}`,
    responseHeaderStub = sinon.stub();

  let retVal = FileUtils.tryGetFileNameFromXHR(
    { getResponseHeader: responseHeaderStub },
    fallbackName
  );

  assert.equal(retVal, fallbackName);
  assert.ok(responseHeaderStub.calledOnce);

  responseHeaderStub.withArgs('Content-Disposition').returns('filename=' + responseName);

  retVal = FileUtils.tryGetFileNameFromXHR({ getResponseHeader: responseHeaderStub }, fallbackName);

  assert.equal(retVal, responseName);
  assert.ok(responseHeaderStub.calledTwice);
});

test('downloading file', function(assert) {
  const data = [1, 2, 3],
    contentType = `${Math.random()}`,
    fileName = `${Math.random()}`,
    saveAsStub = sinon.stub(FileSaver, 'saveAs');

  FileUtils.download(data, contentType, fileName);

  assert.ok(saveAsStub.calledOnce);
  assert.ok(saveAsStub.firstCall.args[0] instanceof Blob);
  assert.equal(saveAsStub.firstCall.args[0].type, contentType);
  assert.equal(saveAsStub.firstCall.args[1], fileName);

  saveAsStub.restore();
});
