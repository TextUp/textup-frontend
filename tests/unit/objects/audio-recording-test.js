import AudioRecording from 'textup-frontend/objects/audio-recording';
import Ember from 'ember';
import sinon from 'sinon';
import { module, test } from 'qunit';

const { run } = Ember;

let recorder, errorSpy, dataSpy;

module('Unit | Object | audio recording', {
  beforeEach() {
    recorder = AudioRecording.create();
    errorSpy = sinon.spy();
    dataSpy = sinon.spy();
    recorder.on('error', errorSpy);
    recorder.on('dataavailable', dataSpy);
  }
});

test('recording with native media recorder', function(assert) {
  const done = assert.async();

  recorder.startRecording();
  recorder.startRecording(); // repeated calls are ignored

  run.later(() => {
    recorder.stopRecording();

    run.later(() => {
      assert.ok(errorSpy.notCalled);
      assert.ok(dataSpy.calledOnce);
      assert.ok(dataSpy.firstCall.args[0] instanceof window.Blob);
      assert.ok(dataSpy.firstCall.args[0].type.indexOf('audio') > -1);

      done();
    }, 500);
  }, 500);
});

test('recording WITHOUT native media recorder', function(assert) {
  const originalMediaRecorder = window.MediaRecorder,
    done = assert.async();
  window.MediaRecorder = null;

  recorder.startRecording();
  recorder.startRecording(); // repeated calls are ignored

  run.later(() => {
    recorder.stopRecording();

    run.later(() => {
      assert.ok(errorSpy.notCalled);
      assert.ok(dataSpy.calledOnce);
      assert.ok(dataSpy.firstCall.args[0] instanceof window.Blob);
      assert.equal(dataSpy.firstCall.args[0].type, 'audio/mpeg', 'polyfill always encodes to mp3');

      window.MediaRecorder = originalMediaRecorder;
      done();
    }, 500);
  }, 500);
});

test('calling stop before starting', function(assert) {
  const done = assert.async();

  recorder.stopRecording();
  recorder.stopRecording();

  run.later(() => {
    assert.ok(errorSpy.notCalled);
    assert.ok(dataSpy.notCalled);

    done();
  }, 500);
});
