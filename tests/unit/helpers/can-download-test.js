import FileUtils from 'textup-frontend/utils/file';
import sinon from 'sinon';
import { canDownload } from 'textup-frontend/helpers/can-download';
import { module, test } from 'qunit';

module('Unit | Helper | can download');

test('determining if can download', function(assert) {
  const canDownloadStub = sinon.stub(FileUtils, 'isDownloadingSupported');

  canDownloadStub.returns(true);
  assert.equal(canDownload(), true);

  canDownloadStub.returns(false);
  assert.equal(canDownload(), false);

  const randVal = Math.random();
  canDownloadStub.returns(randVal);
  assert.equal(canDownload(), randVal);

  canDownloadStub.restore();
});
