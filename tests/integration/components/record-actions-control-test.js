import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import RecordActionsControlComponent from 'textup-frontend/components/record-actions-control';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('record-actions-control', 'Integration | Component | record actions control', {
  integration: true
});

test('inputs', function(assert) {
  this.render(hbs`{{record-actions-control}}`);

  assert.ok(this.$('.record-actions-control').length, 'no inputs is valid');

  const noOp = () => null;
  this.setProperties({
    hasPersonalPhoneNumber: true,
    hasItemsInRecord: true,
    images: [],
    contents: 'hi',
    onContentChange: noOp,
    onAddImage: noOp,
    onRemoveImage: noOp,
    onAddNoteInPast: noOp,
    onAddNote: noOp,
    onCall: noOp,
    onText: noOp,
    onScheduleMessage: noOp
  });

  this.render(hbs`
    {{record-actions-control hasPersonalPhoneNumber=hasPersonalPhoneNumber
      hasItemsInRecord=hasItemsInRecord
      images=images
      contents=contents
      onContentChange=onContentChange
      onAddImage=onAddImage
      onRemoveImage=onRemoveImage
      onAddNoteInPast=onAddNoteInPast
      onAddNote=onAddNote
      onCall=onCall
      onText=onText
      onScheduleMessage=onScheduleMessage}}
  `);

  assert.ok(this.$('.record-actions-control').length, 'all valid inputs');

  this.setProperties({
    invalidHasPersonalPhoneNumber: 88,
    invalidHasItemsInRecord: 88,
    invalidImages: 88,
    invalidContents: [],
    invalidOnContentChange: 'not function',
    invalidOnAddImage: 'not function',
    invalidOnRemoveImage: 'not function',
    invalidOnAddNoteInPast: 'not function',
    invalidOnAddNote: 'not function',
    invalidOnCall: 'not function',
    invalidOnText: 'not function',
    invalidOnScheduleMessage: 'not function'
  });

  assert.throws(() => {
    this.render(hbs`
      {{record-actions-control hasPersonalPhoneNumber=invalidHasPersonalPhoneNumber
        hasItemsInRecord=invalidHasItemsInRecord
        images=invalidImages
        contents=invalidContents
        onContentChange=invalidOnContentChange
        onAddImage=invalidOnAddImage
        onRemoveImage=invalidOnRemoveImage
        onAddNoteInPast=invalidOnAddNoteInPast
        onAddNote=invalidOnAddNote
        onCall=invalidOnCall
        onText=invalidOnText
        onScheduleMessage=invalidOnScheduleMessage}}
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
  assert.ok(this.$('.hide-away-trigger').length, 'has trigger');
  assert.notOk(Ember.$('.hide-away-body').length, 'dropdown is closed');

  this.$('.hide-away-trigger')
    .first()
    .triggerHandler('mousedown');
  wait()
    .then(() => {
      assert.ok(Ember.$('.hide-away-body').length, 'dropdown is open');
      assert.equal(Ember.$('.hide-away-body .dropdown-item').length, 2, 'two dropdown items');
      const text = Ember.$('.hide-away-body .dropdown-item')
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
      assert.ok(Ember.$('.hide-away-body').length, 'dropdown is open');
      assert.equal(Ember.$('.hide-away-body .dropdown-item').length, 3, 'three dropdown items');
      const text = Ember.$('.hide-away-body .dropdown-item')
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
      assert.ok(Ember.$('.hide-away-body').length, 'dropdown is open');
      assert.equal(Ember.$('.hide-away-body .dropdown-item').length, 4, 'four dropdown items');
      const text = Ember.$('.hide-away-body .dropdown-item')
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
  assert.ok(this.$('.hide-away-trigger').length, 'has trigger');
  assert.notOk(Ember.$('.hide-away-body').length, 'dropdown is closed');

  this.$('.hide-away-trigger')
    .first()
    .triggerHandler('mousedown');
  // wait doesn't wait long enough for event listeners to bound to body
  Ember.run.later(() => {
    assert.ok(Ember.$('.hide-away-body').length, 'dropdown is open');
    assert.equal(Ember.$('.hide-away-body .dropdown-item').length, 4, 'four dropdown items');

    Ember.$('.hide-away-body .dropdown-item')
      .eq(0)
      .click();
    // wait doesn't wait long enough
    Ember.run.later(() => {
      assert.notOk(Ember.$('.hide-away-body').length, 'dropdown closes on click');
      assert.ok(onScheduleMessage.calledOnce);

      done();
    }, 500);
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
  assert.ok(this.$('.hide-away-trigger').length, 'has trigger');
  assert.notOk(Ember.$('.hide-away-body').length, 'dropdown is closed');

  this.$('.hide-away-trigger')
    .first()
    .triggerHandler('mousedown');

  Ember.run.later(() => {
    assert.ok(Ember.$('.hide-away-body').length, 'dropdown is open');
    assert.equal(Ember.$('.hide-away-body .dropdown-item').length, 4, 'four dropdown items');

    Ember.$('.hide-away-body .dropdown-item')
      .eq(1)
      .click();
    Ember.run.later(() => {
      assert.notOk(Ember.$('.hide-away-body').length, 'dropdown closes on click');
      assert.ok(onCall.calledOnce);

      done();
    }, 500);
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
  assert.ok(this.$('.hide-away-trigger').length, 'has trigger');
  assert.notOk(Ember.$('.hide-away-body').length, 'dropdown is closed');

  this.$('.hide-away-trigger')
    .first()
    .triggerHandler('mousedown');
  Ember.run.later(() => {
    assert.ok(Ember.$('.hide-away-body').length, 'dropdown is open');
    assert.equal(Ember.$('.hide-away-body .dropdown-item').length, 4, 'four dropdown items');

    Ember.$('.hide-away-body .dropdown-item')
      .eq(2)
      .click();
    Ember.run.later(() => {
      assert.notOk(Ember.$('.hide-away-body').length, 'dropdown closes on click');
      assert.ok(onAddNoteInPast.calledOnce);

      done();
    }, 500);
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
  assert.ok(this.$('.hide-away-trigger').length, 'has trigger');
  assert.notOk(Ember.$('.hide-away-body').length, 'dropdown is closed');

  this.$('.hide-away-trigger')
    .first()
    .triggerHandler('mousedown');
  Ember.run.later(() => {
    assert.ok(Ember.$('.hide-away-body').length, 'dropdown is open');
    assert.equal(Ember.$('.hide-away-body .dropdown-item').length, 4, 'four dropdown items');

    Ember.$('.hide-away-body .dropdown-item')
      .eq(3)
      .click();
    Ember.run.later(() => {
      assert.notOk(Ember.$('.hide-away-body').length, 'dropdown closes on click');
      assert.ok(onAddNote.calledOnce);

      done();
    }, 500);
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
