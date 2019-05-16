import AudioUtils from 'textup-frontend/utils/audio';
import AudioRecording from 'textup-frontend/objects/audio-recording';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { typeOf, run } = Ember;

moduleForComponent('audio-recorder', 'Integration | Component | audio recorder', {
  integration: true,
});

test('properties', function(assert) {
  this.setProperties({ aFunc: () => null, aBool: false, aString: 'hi' });

  this.render(hbs`{{audio-recorder}}`);

  assert.ok(this.$('.audio-control').length, 'did render');
  assert.ok(this.$('.audio-control--recording').length);

  this.render(hbs`{{audio-recorder
    onError=aFunc
    onFinish=aFunc
    disabled=aBool
    message=aString
    unsupportedMessage=aString
    startMessage=aString
    recordingMessage=aString
    processingMessage=aString}}
  `);

  assert.ok(this.$('.audio-control').length, 'did render');
  assert.ok(this.$('.audio-control--recording').length);
});

test('disabled', function(assert) {
  this.render(hbs`{{audio-recorder disabled=true}}`);

  assert.ok(this.$('.audio-control').length, 'did render');
  assert.ok(this.$('.audio-control--recording').length);
  assert.ok(this.$('.audio-control--disabled').length);
});

test('unsupported', function(assert) {
  const isSupportedStub = sinon.stub(AudioUtils, 'isRecordingSupported'),
    unsupportedMessage = `${Math.random()}`;
  isSupportedStub.returns(true);

  this.setProperties({ unsupportedMessage });

  this.render(hbs`{{audio-recorder unsupportedMessage=unsupportedMessage}}`);

  assert.ok(this.$('.audio-control').length, 'did render');
  assert.ok(this.$('.audio-control--recording').length);
  assert.notOk(this.$('.audio-control--unsupported').length);
  assert.equal(
    this.$()
      .text()
      .indexOf(unsupportedMessage),
    -1
  );

  isSupportedStub.returns(false);

  this.render(hbs`{{audio-recorder unsupportedMessage=unsupportedMessage}}`);

  assert.ok(this.$('.audio-control').length, 'did render');
  assert.ok(this.$('.audio-control--recording').length);
  assert.ok(this.$('.audio-control--unsupported').length);
  assert.ok(
    this.$()
      .text()
      .indexOf(unsupportedMessage) > -1
  );

  isSupportedStub.restore();
});

test('has error', function(assert) {
  const done = assert.async(),
    onEventSpy = sinon.spy(),
    startRecordingSpy = sinon.spy(),
    onErrorSpy = sinon.spy(),
    errorMsg = `${Math.random()}`,
    recordingCreationStub = sinon.stub(AudioRecording, 'create').returns({
      on: onEventSpy,
      startRecording: startRecordingSpy,
    });

  this.set('onError', onErrorSpy);
  this.render(hbs`{{audio-recorder onError=onError}}`);

  assert.ok(this.$('.audio-control').length, 'did render');
  assert.ok(this.$('.audio-control--recording').length);
  assert.notOk(this.$('.audio-control--error').length);

  this.$('button')
    .first()
    .triggerHandler('click');
  wait()
    .then(() => {
      assert.ok(recordingCreationStub.calledOnce);
      assert.ok(onEventSpy.called);
      assert.ok(startRecordingSpy.calledOnce);
      assert.ok(onErrorSpy.notCalled);

      const errorArgs = onEventSpy.args.find(argArray => argArray[0] === 'error');
      assert.ok(errorArgs, 'the error event was called with a handler');
      assert.ok(typeOf(errorArgs[1]) === 'instance');
      assert.ok(typeOf(errorArgs[2]) === 'function');

      errorArgs[2].call(errorArgs[1], errorMsg);
      return wait();
    })
    .then(() => {
      assert.ok(onErrorSpy.calledOnce);
      assert.ok(this.$('.audio-control--error').length);
      assert.ok(
        this.$()
          .text()
          .indexOf(errorMsg) > -1
      );

      recordingCreationStub.restore();
      done();
    });
});

test('passing in message overrides any currently displayed message', function(assert) {
  run(() => {
    const message = `${Math.random()}`,
      startMessage = `${Math.random()}`;

    this.setProperties({ message, startMessage });

    this.render(hbs`{{audio-recorder startMessage=startMessage}}`);

    assert.ok(this.$('.audio-control').length, 'did render');
    assert.ok(this.$('.audio-control--recording').length);
    assert.ok(
      this.$()
        .text()
        .indexOf(startMessage) > -1
    );

    this.render(hbs`{{audio-recorder message=message startMessage=startMessage}}`);

    assert.ok(this.$('.audio-control').length, 'did render');
    assert.ok(this.$('.audio-control--recording').length);
    assert.ok(
      this.$()
        .text()
        .indexOf(message) > -1
    );
  });
});

test('recording + reusing for another recording', function(assert) {
  assert.ok(1 === 1);

  const done = assert.async(),
    onError = sinon.spy(),
    onFinish = sinon.spy(),
    startMessage = `${Math.random()}`,
    recordingMessage = `${Math.random()}`,
    processingMessage = `${Math.random()}`;

  this.setProperties({
    onError,
    onFinish,
    startMessage,
    recordingMessage,
    processingMessage,
  });

  this.render(hbs`{{audio-recorder onError=onError
  onFinish=onFinish
  startMessage=startMessage
  recordingMessage=recordingMessage
  processingMessage=processingMessage}}
`);

  assert.ok(this.$('.audio-control').length, 'did render');
  assert.ok(this.$('.audio-control--recording').length);
  assert.notOk(this.$('button.button--active').length, 'not recording yet');
  assert.ok(
    this.$()
      .text()
      .indexOf(startMessage) > -1
  );

  this.$('button')
    .first()
    .triggerHandler('click');
  run.later(() => {
    assert.ok(this.$('button.button--active').length, 'is recording');
    assert.ok(onError.notCalled, 'error handler not called');
    assert.ok(onFinish.notCalled, 'finish handler not called');
    assert.ok(
      this.$()
        .text()
        .indexOf(recordingMessage) > -1
    );

    run.later(() => {
      this.$('button')
        .first()
        .triggerHandler('click');
      run.later(() => {
        assert.notOk(this.$('button.button--active').length, 'stopped recording');
        assert.ok(onError.notCalled);
        assert.ok(
          this.$()
            .text()
            .indexOf(startMessage) > -1
        );
        assert.ok(onFinish.calledOnce);
        assert.equal(onFinish.firstCall.args.length, 2);
        assert.ok(onFinish.firstCall.args.every(arg => typeOf(arg) === 'string'));
        assert.ok(onFinish.firstCall.args[0].indexOf('audio') > -1);

        this.$('button')
          .first()
          .triggerHandler('click');
        wait().then(() => {
          assert.ok(this.$('button.button--active').length, 'is recording');
          assert.ok(onError.notCalled);
          assert.ok(onFinish.calledOnce);
          assert.ok(
            this.$()
              .text()
              .indexOf(recordingMessage) > -1
          );

          done();
        });
      }, 500);
    }, 500);
  }, 500);
});
