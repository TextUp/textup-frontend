import Ember from 'ember';
import sinon from 'sinon';
import { module, test } from 'qunit';

const { run, typeOf } = Ember;

let encoderWorker;

module('Unit | Worker | mp3 encoder worker', {
  beforeEach() {
    encoderWorker = new window.Worker('/workers/mp3-encoder-worker.js');
    encoderWorker.onmessage = sinon.spy();
    encoderWorker.onerror = sinon.spy();
    encoderWorker.onmessageerror = sinon.spy();
  },
  afterEach() {
    encoderWorker.terminate();
  }
});

test('invalid message', function(assert) {
  const done = assert.async();

  encoderWorker.postMessage(null);
  encoderWorker.postMessage('not in correct format');
  encoderWorker.postMessage(['correct format but not invalid action name']);

  // `wait` doesn't wait long enough
  run.later(() => {
    assert.ok(encoderWorker.onmessage.notCalled);
    assert.ok(encoderWorker.onerror.notCalled);
    assert.ok(encoderWorker.onmessageerror.notCalled);

    done();
  }, 500);
});

test('calling actions without initializing', function(assert) {
  const done = assert.async();

  encoderWorker.postMessage(['encode']);
  encoderWorker.postMessage(['dump']);
  encoderWorker.postMessage(['close']);

  // `wait` doesn't wait long enough
  run.later(() => {
    assert.ok(encoderWorker.onmessage.notCalled, 'all ignored');
    assert.ok(encoderWorker.onerror.notCalled, 'not valid');
    assert.ok(encoderWorker.onmessageerror.notCalled);

    done();
  }, 500);
});

test('initializing valid worker', function(assert) {
  const done = assert.async();

  encoderWorker.postMessage(['init']); // without a number defaults to 44100
  encoderWorker.postMessage(['init', 123]); // calling repeat times is okay

  // `wait` doesn't wait long enough
  run.later(() => {
    assert.ok(encoderWorker.onmessage.notCalled);
    assert.ok(encoderWorker.onerror.notCalled);
    assert.ok(encoderWorker.onmessageerror.notCalled);

    done();
  }, 500);
});

// TODO
// test('initializing invalid worker', function(assert) {
//   const done = assert.async();
//
//   encoderWorker.postMessage(['init', 'not a valid number']);
//
//   // `wait` doesn't wait long enough
//   run.later(() => {
//     assert.ok(encoderWorker.onmessage.notCalled);
//     assert.ok(encoderWorker.onerror.calledOnce);
//     assert.ok(encoderWorker.onmessageerror.notCalled);
//
//     done();
//   }, 500);
// });

test('encoding data overall', function(assert) {
  const done = assert.async();

  encoderWorker.postMessage(['init', 44100]);
  encoderWorker.postMessage(['encode', [0.0, 0.1, 0.2, 0.3, 0.4, 0.5]]);
  encoderWorker.postMessage(['dump']);
  encoderWorker.postMessage(['close']);

  // `wait` doesn't wait long enough
  run.later(() => {
    assert.ok(encoderWorker.onerror.notCalled);
    assert.ok(encoderWorker.onmessageerror.notCalled);
    assert.ok(encoderWorker.onmessage.calledOnce);
    assert.ok(encoderWorker.onmessage.firstCall.args[0] instanceof window.MessageEvent);
    assert.equal(typeOf(encoderWorker.onmessage.firstCall.args[0].data), 'array');

    done();
  }, 500);
});
