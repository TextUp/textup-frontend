import FileUtils from 'textup-frontend/utils/file';
import FileSaver from 'file-saver';
import sinon from 'sinon';
import { module, test } from 'qunit';

module('Unit | Utility | file');

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
  assert.ok(saveAsStub.firstCall.args[0] instanceof window.Blob);
  assert.equal(saveAsStub.firstCall.args[0].type, contentType);
  assert.equal(saveAsStub.firstCall.args[1], fileName);

  saveAsStub.restore();
});
