import * as AudioUtils from 'textup-frontend/utils/audio';
import sinon from 'sinon';
import { canRecordAudio } from 'textup-frontend/helpers/can-record-audio';
import { module, test } from 'qunit';

module('Unit | Helper | can record audio');

test('determining if can record audio', function(assert) {
  const canRecordStub = sinon.stub(AudioUtils, 'isRecordingSupported');

  canRecordStub.returns(true);
  assert.equal(canRecordAudio(), true);

  canRecordStub.returns(false);
  assert.equal(canRecordAudio(), false);

  const randVal = Math.random();
  canRecordStub.returns(randVal);
  assert.equal(canRecordAudio(), randVal);

  canRecordStub.restore();
});
