import * as AudioUtils from 'textup-frontend/utils/audio';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import RecordActionsControlComponent from 'textup-frontend/components/record-actions-control';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { run } = Ember;

moduleForComponent('record-actions-control', 'Integration | Component | record actions control', {
  integration: true
});

test('inputs', function(assert) {
  this.render(hbs`{{record-actions-control}}`);

  assert.ok(this.$('.record-actions-control').length, 'no inputs is valid');

  this.setProperties({ array: [], func: () => null });

  this.render(hbs`
    {{record-actions-control hasPersonalPhoneNumber=true
      hasItemsInRecord=true
      images=array
      audio=array
      contents=contents
      onHeightChange=func
      onContentChange=func
      onAddImage=func
      onAddAudio=func
      onRemoveMedia=func
      onAddNoteInPast=func
      onAddNote=func
      onCall=func
      onText=func
      onScheduleMessage=func}}
  `);

  assert.ok(this.$('.record-actions-control').length, 'all valid inputs');

  assert.throws(() => {
    this.render(hbs`
      {{record-actions-control hasPersonalPhoneNumber=888
        hasItemsInRecord=888
        images=888
        audio=888
        contents=888
        onHeightChange=888
        onContentChange=888
        onAddImage=888
        onAddAudio=888
        onRemoveMedia=888
        onAddNoteInPast=888
        onAddNote=888
        onCall=888
        onText=888
        onScheduleMessage=888}}
    `);
  }, 'invalid inputs');
});

test('rendering block', function(assert) {
  const blockText = `${Math.random()}`;

  this.setProperties({ blockText });
  this.render(hbs`
    {{#record-actions-control}}
      {{blockText}}
    {{/record-actions-control}}
  `);

  assert.ok(this.$('.record-actions-control').length, 'did render');
  let text = this.$().text();
  assert.ok(text.includes(blockText), 'block has rendered');
});

test('rendering for personal phone number and items in record', function(assert) {
  const done = assert.async();

  this.setProperties({ hasNums: false, hasItems: false });
  this.render(
    hbs`{{record-actions-control hasPersonalPhoneNumber=hasNums hasItemsInRecord=hasItems}}`
  );

  assert.ok(this.$('.record-actions-control').length, 'did render');
  assert.ok(this.$('.record-actions-control__dropdown-trigger').length, 'has trigger');
  assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown is closed');

  this.$('.record-actions-control__dropdown-trigger')
    .first()
    .triggerHandler('click');
  wait()
    .then(() => {
      assert.ok(Ember.$('.pop-over__body--open').length, 'dropdown is open');
      assert.equal(Ember.$('.pop-over__body--open .dropdown-item').length, 2, 'two dropdown items');
      const text = Ember.$('.pop-over__body--open .dropdown-item')
        .text()
        .toLowerCase();
      assert.ok(text.includes('schedule'), 'has schedule');
      assert.notOk(text.includes('call'), 'no call');
      assert.notOk(text.includes('past'), 'no past note');
      assert.ok(text.includes('note'), 'has note');

      this.setProperties({ hasNums: true, hasItems: false });
      return wait();
    })
    .then(() => {
      assert.ok(Ember.$('.pop-over__body--open').length, 'dropdown is open');
      assert.equal(
        Ember.$('.pop-over__body--open .dropdown-item').length,
        3,
        'three dropdown items'
      );
      const text = Ember.$('.pop-over__body--open .dropdown-item')
        .text()
        .toLowerCase();
      assert.ok(text.includes('schedule'), 'has schedule');
      assert.ok(text.includes('call'), 'has call');
      assert.notOk(text.includes('past'), 'no past note');
      assert.ok(text.includes('note'), 'has note');

      this.setProperties({ hasNums: true, hasItems: true });
      return wait();
    })
    .then(() => {
      assert.ok(Ember.$('.pop-over__body--open').length, 'dropdown is open');
      assert.equal(
        Ember.$('.pop-over__body--open .dropdown-item').length,
        4,
        'four dropdown items'
      );
      const text = Ember.$('.pop-over__body--open .dropdown-item')
        .text()
        .toLowerCase();
      assert.ok(text.includes('schedule'), 'has schedule');
      assert.ok(text.includes('call'), 'has call');
      assert.ok(text.includes('past'), 'no past note');
      assert.ok(text.includes('note'), 'has note');

      done();
    });
});

test('updating content follows DDAU', function(assert) {
  const onContentChange = sinon.spy(),
    contents = `${Math.random()}`,
    contents2 = `${Math.random()}`,
    contents3 = `${Math.random()}`,
    done = assert.async();

  this.setProperties({ contents, onContentChange });
  this.render(hbs`{{record-actions-control contents=contents onContentChange=onContentChange}}`);

  assert.ok(this.$('.record-actions-control').length, 'did render');
  assert.equal(this.$('textarea').val(), contents, 'contents match');

  this.$('textarea').val(contents2);
  assert.equal(this.$('textarea').val(), contents2, 'did update textarea contents');
  this.$('textarea').change();
  wait()
    .then(() => {
      assert.ok(onContentChange.calledOnce, 'change handler called (actions up)');
      assert.equal(onContentChange.firstCall.args[0], contents2, 'handler passed new value');
      assert.equal(this.get('contents'), contents, 'contents property did not change (no data up)');

      this.set('contents', contents3);
      return wait();
    })
    .then(() => {
      assert.equal(
        this.$('textarea').val(),
        contents3,
        'can overwrite the textarea value by setting the prop (data down)'
      );

      done();
    });
});

test('send text handler returns outcome', function(assert) {
  const onText = sinon.stub(),
    randVal = Math.random(),
    obj = RecordActionsControlComponent.create({ onText });
  onText.callsFake(() => randVal);

  assert.equal(obj._onSendText(), randVal, 'send handler return outcome');
  assert.ok(onText.calledOnce);
});

test('trigger schedule message action', function(assert) {
  const done = assert.async(),
    onScheduleMessage = sinon.stub();

  this.setProperties({ hasNums: true, hasItems: true, onScheduleMessage });
  this.render(hbs`
    {{record-actions-control hasPersonalPhoneNumber=hasNums
      hasItemsInRecord=hasItems
      onScheduleMessage=onScheduleMessage}}
  `);

  assert.ok(this.$('.record-actions-control').length, 'did render');
  assert.ok(this.$('.record-actions-control__dropdown-trigger').length, 'has trigger');
  assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown is closed');

  this.$('.record-actions-control__dropdown-trigger')
    .first()
    .triggerHandler('click');
  // wait doesn't wait long enough for event listeners to bound to body
  Ember.run.later(() => {
    assert.ok(Ember.$('.pop-over__body--open').length, 'dropdown is open');
    assert.equal(Ember.$('.pop-over__body--open .dropdown-item').length, 4, 'four dropdown items');

    Ember.$('.pop-over__body--open .dropdown-item')
      .first()
      .click();
    // wait doesn't wait long enough
    Ember.run.later(() => {
      assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown closes on click');
      assert.ok(onScheduleMessage.calledOnce);

      done();
    }, 1000);
  }, 500);
});

test('trigger make call action', function(assert) {
  const done = assert.async(),
    onCall = sinon.stub();

  this.setProperties({ hasNums: true, hasItems: true, onCall });
  this.render(hbs`
    {{record-actions-control hasPersonalPhoneNumber=hasNums
      hasItemsInRecord=hasItems
      onCall=onCall}}
  `);

  assert.ok(this.$('.record-actions-control').length, 'did render');
  assert.ok(this.$('.record-actions-control__dropdown-trigger').length, 'has trigger');
  assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown is closed');

  this.$('.record-actions-control__dropdown-trigger')
    .first()
    .triggerHandler('click');

  Ember.run.later(() => {
    assert.ok(Ember.$('.pop-over__body--open').length, 'dropdown is open');
    assert.equal(Ember.$('.pop-over__body--open .dropdown-item').length, 4, 'four dropdown items');

    Ember.$('.pop-over__body--open .dropdown-item')
      .eq(1)
      .click();
    Ember.run.later(() => {
      assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown closes on click');
      assert.ok(onCall.calledOnce);

      done();
    }, 1000);
  }, 500);
});

test('trigger add note in past action', function(assert) {
  const done = assert.async(),
    onAddNoteInPast = sinon.stub();

  this.setProperties({ hasNums: true, hasItems: true, onAddNoteInPast });
  this.render(hbs`
    {{record-actions-control hasPersonalPhoneNumber=hasNums
      hasItemsInRecord=hasItems
      onAddNoteInPast=onAddNoteInPast}}
  `);

  assert.ok(this.$('.record-actions-control').length, 'did render');
  assert.ok(this.$('.record-actions-control__dropdown-trigger').length, 'has trigger');
  assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown is closed');

  this.$('.record-actions-control__dropdown-trigger')
    .first()
    .triggerHandler('click');
  Ember.run.later(() => {
    assert.ok(Ember.$('.pop-over__body--open').length, 'dropdown is open');
    assert.equal(Ember.$('.pop-over__body--open .dropdown-item').length, 4, 'four dropdown items');

    Ember.$('.pop-over__body--open .dropdown-item')
      .eq(2)
      .click();
    Ember.run.later(() => {
      assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown closes on click');
      assert.ok(onAddNoteInPast.calledOnce);

      done();
    }, 1000);
  }, 500);
});

test('trigger add note now action', function(assert) {
  const done = assert.async(),
    onAddNote = sinon.stub();

  this.setProperties({ hasNums: true, hasItems: true, onAddNote });
  this.render(hbs`
    {{record-actions-control hasPersonalPhoneNumber=hasNums
      hasItemsInRecord=hasItems
      onAddNote=onAddNote}}
  `);

  assert.ok(this.$('.record-actions-control').length, 'did render');
  assert.ok(this.$('.record-actions-control__dropdown-trigger').length, 'has trigger');
  assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown is closed');

  this.$('.record-actions-control__dropdown-trigger')
    .first()
    .triggerHandler('click');
  Ember.run.later(() => {
    assert.ok(Ember.$('.pop-over__body--open').length, 'dropdown is open');
    assert.equal(Ember.$('.pop-over__body--open .dropdown-item').length, 4, 'four dropdown items');

    Ember.$('.pop-over__body--open .dropdown-item')
      .eq(3)
      .click();
    Ember.run.later(() => {
      assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown closes on click');
      assert.ok(onAddNote.calledOnce);

      done();
    }, 1000);
  }, 500);
});

test('sending text', function(assert) {
  const done = assert.async(),
    onText = sinon.stub(),
    contents = `${Math.random()}`;

  this.setProperties({ contents, onText });
  this.render(hbs`{{record-actions-control contents=contents onText=onText}}`);

  assert.ok(this.$('.record-actions-control').length, 'did render');
  assert.ok(this.$('.compose-text .action-button').length, 'has send text button');
  assert.notOk(
    this.$('.compose-text .action-button:disabled').length,
    'send text button is NOT disabled'
  );

  this.$('.compose-text .action-button')
    .first()
    .click();
  wait().then(() => {
    assert.ok(onText.calledOnce);
    assert.ok(onText.firstCall.args[0] === contents, 'first arg is contents');
    assert.ok(Ember.isArray(onText.firstCall.args[1]), 'second arg is images array');

    done();
  });
});

test('test adding media when audio recording is supported', function(assert) {
  const done = assert.async(),
    onHeightChange = sinon.spy(),
    canRecordStub = sinon.stub(AudioUtils, 'isRecordingSupported').returns(true);

  this.setProperties({ onHeightChange });
  this.render(hbs`{{record-actions-control onHeightChange=onHeightChange}}`);

  assert.ok(this.$('.record-actions-control').length, 'did render');
  assert.ok(this.$('.compose-text .pop-over').length, 'has media pop over in compose text');
  assert.ok(this.$('.compose-text .pop-over button').length);
  assert.notOk(Ember.$('.pop-over__body--open').length);
  assert.ok(onHeightChange.notCalled);

  this.$('.compose-text .pop-over button')
    .first()
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(Ember.$('.pop-over__body--open').length);
    assert.ok(Ember.$('.pop-over__body--open .photo-control__add').length);
    assert.equal(Ember.$('.pop-over__body--open .dropdown-item').length, 2);
    assert.ok(Ember.$('.pop-over__body--open li.dropdown-item:not(.photo-control__add)').length);
    assert.notOk(
      this.$('.record-actions-control__media-drawer').length,
      'media drawer is not open'
    );

    Ember.$('.pop-over__body--open li.dropdown-item:not(.photo-control__add)')
      .first()
      .click(); // actually trigger click so pop over body will close
    run.later(() => {
      assert.notOk(Ember.$('.pop-over__body--open').length, 'pop over is closed on click');
      assert.ok(this.$('.record-actions-control__media-drawer').length, 'media drawer is open');
      assert.ok(this.$('.record-actions-control__media-drawer .audio-control--recording').length);
      assert.ok(onHeightChange.calledOnce);

      canRecordStub.restore();
      done();
    }, 1000);
  });
});

test('test adding images when audio recording is NOT supported', function(assert) {
  const canRecordStub = sinon.stub(AudioUtils, 'isRecordingSupported').returns(false);

  this.render(hbs`{{record-actions-control}}`);

  assert.ok(this.$('.record-actions-control').length, 'did render');
  assert.notOk(this.$('.compose-text .pop-over').length, 'do not have pop-over');
  assert.ok(this.$('.compose-text .photo-control__add').length, 'has button to add media');

  canRecordStub.restore();
});
