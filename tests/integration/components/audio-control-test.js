import * as AudioUtils from 'textup-frontend/utils/audio';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { mockValidMediaAudio } from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

const { run, typeOf } = Ember;

moduleForComponent('audio-control', 'Integration | Component | audio control', {
  integration: true,
  beforeEach() {
    this.inject.service('store');
  }
});

test('properties', function(assert) {
  run(() => {
    this.setProperties({ audio: [mockValidMediaAudio(this.store)], func: () => null });

    this.render(hbs`{{audio-control}}`);

    assert.ok(this.$('.audio-wrapper').length);

    this.render(hbs`{{audio-control audio=audio onAdd=func onRemove=func readOnly=true}}`);

    assert.ok(this.$('.audio-wrapper').length);

    assert.throws(() => {
      this.render(hbs`{{audio-control audio="bad" onAdd="bad" onRemove="bad" readOnly="bad"}}`);
    });
  });
});

test('passing list display options to list component', function(assert) {
  run(() => {
    const time1 = new Date(Date.now()),
      time2 = new Date(Date.now() + 1000),
      source1 = 'base64;valid123',
      source2 = 'base64;valid456',
      audioEl1 = this.store.createFragment('media-element', { whenCreated: time1 }),
      audioEl2 = this.store.createFragment('media-element', { whenCreated: time2 });
    audioEl1.addVersion('audio/mpeg', source1);
    audioEl2.addVersion('audio/mpeg', source2);
    this.setProperties({ audio: [audioEl2, audioEl1] });

    this.render(hbs`{{audio-control audio=audio listProps=(hash sortPropName='whenCreated')}}`);

    assert.ok(this.$('.audio-wrapper').length);
    assert.ok(this.$('.audio-control').length, 2);
    assert.ok(this.$('.audio-control source').length, 2);

    assert.equal(
      this.$('.audio-control source')
        .eq(0)
        .attr('src'),
      source1
    );
    assert.equal(
      this.$('.audio-control source')
        .eq(1)
        .attr('src'),
      source2
    );

    this.render(hbs`
      {{audio-control audio=audio
        listProps=(hash sortPropName='whenCreated' sortLowToHigh=false)}}
    `);

    assert.ok(this.$('.audio-wrapper').length);
    assert.ok(this.$('.audio-control').length, 2);
    assert.ok(this.$('.audio-control source').length, 2);

    assert.equal(
      this.$('.audio-control source')
        .eq(0)
        .attr('src'),
      source2
    );
    assert.equal(
      this.$('.audio-control source')
        .eq(1)
        .attr('src'),
      source1
    );

    this.render(hbs`{{audio-control audio=audio listProps=(hash maxNumToDisplay=1)}}`);

    assert.ok(this.$('.audio-control').length, 1);
    assert.ok(this.$('.audio-control source').length, 1);
    assert.equal(
      this.$('.audio-control source')
        .eq(0)
        .attr('src'),
      source2,
      'returns to passed-in order'
    );
  });
});

test('rendering block', function(assert) {
  const blockClass = 'audio-control-test-class',
    blockSpy = sinon.spy(),
    done = assert.async();
  this.setProperties({ blockClass, blockSpy });

  this.render(hbs`
    {{#audio-control as |hideShow|}}
      <span class={{blockClass}} onclick={{action blockSpy hideShow}}></span>
    {{/audio-control}}
  `);

  assert.ok(this.$('.audio-wrapper').length);
  assert.equal(this.$(`.${blockClass}`).length, 1);
  assert.ok(blockSpy.notCalled);

  this.$(`.${blockClass}`)
    .first()
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(blockSpy.calledOnce);

    const blockObj = blockSpy.firstCall.args[0];
    assert.equal(typeOf(blockObj), 'object');
    assert.equal(blockObj.isOpen, false);
    assert.equal(typeOf(blockObj.actions), 'object');
    assert.equal(typeOf(blockObj.actions.open), 'function');
    assert.equal(typeOf(blockObj.actions.close), 'function');
    assert.equal(typeOf(blockObj.actions.toggle), 'function');
    assert.equal(typeOf(blockObj.actions.closeThenCall), 'function');

    done();
  });
});

test('not readonly and no actions == readonly', function(assert) {
  this.render(hbs`{{audio-control readOnly=false}}`);

  assert.ok(this.$('.audio-wrapper').length);
  assert.notOk(this.$('.audio-wrapper button:not(.audio-control__button)').length);
});

test('readonly WITH actions', function(assert) {
  this.setProperties({ func: () => null });
  this.render(hbs`{{audio-control readOnly=true onAdd=func onRemove=func}}`);

  assert.ok(this.$('.audio-wrapper').length);
  assert.notOk(this.$('.audio-wrapper button:not(.audio-control__button)').length);
});

test('removing', function(assert) {
  const done = assert.async(),
    el1 = mockValidMediaAudio(this.store),
    onRemove = sinon.spy();
  this.setProperties({ audio: [el1], onRemove });
  this.render(hbs`{{audio-control audio=audio onRemove=onRemove}}`);

  assert.ok(this.$('.audio-wrapper').length);
  assert.equal(
    this.$('.audio-wrapper button:not(.audio-control__button)').length,
    1,
    '1 remove button next to the one audio element'
  );

  this.$('.audio-wrapper button:not(.audio-control__button)')
    .first()
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(onRemove.calledOnce);
    assert.ok(onRemove.calledWith(el1));

    done();
  });
});

test('adding when recording is supported', function(assert) {
  run(() => {
    const isSupportedStub = sinon.stub(AudioUtils, 'isRecordingSupported').returns(true),
      done = assert.async(),
      onAdd = sinon.spy(),
      startAddMessage = `${Math.random()}`,
      cancelAddMessage = `${Math.random()}`;
    this.setProperties({ onAdd, startAddMessage, cancelAddMessage });
    this.render(hbs`
      {{audio-control onAdd=onAdd
          startAddMessage=startAddMessage
          cancelAddMessage=cancelAddMessage}}
    `);

    assert.ok(this.$('.audio-wrapper').length);
    assert.equal(
      this.$('.audio-wrapper button:not(.audio-control__button)').length,
      1,
      '1 add button'
    );
    assert.ok(
      this.$()
        .text()
        .indexOf(startAddMessage) > -1
    );

    this.$('.audio-wrapper button:not(.audio-control__button)')
      .first()
      .triggerHandler('click');
    wait().then(() => {
      assert.ok(this.$('.audio-control--recording').length, 'audio recorder appears');
      assert.ok(onAdd.notCalled);
      assert.ok(
        this.$()
          .text()
          .indexOf(cancelAddMessage) > -1
      );

      this.$('.audio-control--recording button')
        .first()
        .triggerHandler('click');
      run.later(() => {
        assert.ok(onAdd.notCalled);
        this.$('.audio-control--recording button')
          .first()
          .triggerHandler('click');

        run.later(() => {
          assert.ok(onAdd.calledOnce);
          assert.ok(onAdd.firstCall.args[0].indexOf('audio') > -1);
          assert.ok(onAdd.firstCall.args[1].indexOf('base64') > -1);

          assert.notOk(
            this.$('.audio-control--recording').length,
            'audio recorder disappears after recording is finished'
          );
          assert.ok(
            this.$()
              .text()
              .indexOf(startAddMessage) > -1
          );

          isSupportedStub.restore();
          done();
        }, 1000);
      }, 500);
    });
  });
});

test('trying to add when recording is not supported', function(assert) {
  const isSupportedStub = sinon.stub(AudioUtils, 'isRecordingSupported').returns(false),
    onAdd = sinon.spy(),
    startAddMessage = `${Math.random()}`;
  this.setProperties({ onAdd, startAddMessage });
  this.render(hbs`{{audio-control onAdd=onAdd startAddMessage=startAddMessage}}`);

  assert.ok(this.$('.audio-wrapper').length);
  assert.equal(
    this.$('.audio-wrapper button:not(.audio-control__button)').length,
    0,
    'no add button because not supported'
  );
  assert.ok(
    this.$()
      .text()
      .indexOf(startAddMessage) === -1
  );

  isSupportedStub.restore();
});
