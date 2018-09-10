import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { mockRecordClusters } from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';

const { typeOf } = Ember;
let store;

moduleForComponent('care-record', 'Integration | Component | care record', {
  integration: true,
  beforeEach() {
    store = Ember.getOwner(this).lookup('service:store');
  }
});

test('empty + invalid inputs', function(assert) {
  this.render(hbs`{{care-record}}`);

  assert.ok(this.$('.care-record').length, 'no inputs is ok');

  this.setProperties({
    invalidCanAddToRecord: 88,
    invalidCanModifyExistingInRecord: 88,
    invalidNextFutureFire: 88,
    invalidPersonalPhoneNumber: 88,
    invalidRecordClusters: 88,
    invalidNumRecordItems: 'not a number',
    invalidTotalNumRecordItems: 'not a number',
    invalidImages: 88,
    invalidContents: 88,
    invalidDoRegister: 88,
    invalidOnEditNote: 88,
    invalidOnRestoreNote: 88,
    invalidOnViewNoteHistory: 88,
    invalidOnLoadRecordItems: 88,
    invalidOnRefreshRecordItems: 88,
    invalidOnViewScheduledMessages: 88,
    invalidOnContentChange: 88,
    invalidOnAddImage: 88,
    invalidOnRemoveImage: 88,
    invalidOnAddNote: 88,
    invalidOnCall: 88,
    invalidOnText: 88,
    invalidOnScheduleMessage: 88,
    invalidNoRecordItemsMessage: 88,
    invalidNoAddToRecordMessage: 88,
    invalidStartCallMessage: 88,
    invalidAddNoteInPastMessage: 88
  });

  assert.throws(() => {
    this.render(hbs`
    {{care-record canAddToRecord=invalidCanAddToRecord
      canModifyExistingInRecord=invalidCanModifyExistingInRecord
      nextFutureFire=invalidNextFutureFire
      personalPhoneNumber=invalidPersonalPhoneNumber
      recordClusters=invalidRecordClusters
      numRecordItems=invalidNumRecordItems
      totalNumRecordItems=invalidTotalNumRecordItems
      images=invalidImages
      contents=invalidContents
      doRegister=invalidDoRegister
      onEditNote=invalidOnEditNote
      onRestoreNote=invalidOnRestoreNote
      onViewNoteHistory=invalidOnViewNoteHistory
      onLoadRecordItems=invalidOnLoadRecordItems
      onRefreshRecordItems=invalidOnRefreshRecordItems
      onViewScheduledMessages=invalidOnViewScheduledMessages
      onContentChange=invalidOnContentChange
      onAddImage=invalidOnAddImage
      onRemoveImage=invalidOnRemoveImage
      onAddNote=invalidOnAddNote
      onCall=invalidOnCall
      onText=invalidOnText
      onScheduleMessage=invalidOnScheduleMessage
      noRecordItemsMessage=invalidNoRecordItemsMessage
      noAddToRecordMessage=invalidNoAddToRecordMessage
      startCallMessage=invalidStartCallMessage
      addNoteInPastMessage=invalidAddNoteInPastMessage}}
  `);
  }, 'invalid types');
});

test('all valid inputs', function(assert) {
  this.setProperties({
    canAddToRecord: true,
    canModifyExistingInRecord: true,
    nextFutureFire: new Date(),
    personalPhoneNumber: 'ok',
    recordClusters: [],
    numRecordItems: 88,
    totalNumRecordItems: 88,
    images: [],
    contents: 'ok',
    doRegister: () => null,
    onEditNote: () => null,
    onRestoreNote: () => null,
    onViewNoteHistory: () => null,
    onLoadRecordItems: () => null,
    onRefreshRecordItems: () => null,
    onViewScheduledMessages: () => null,
    onContentChange: () => null,
    onAddImage: () => null,
    onRemoveImage: () => null,
    onAddNote: () => null,
    onCall: () => null,
    onText: () => null,
    onScheduleMessage: () => null,
    noRecordItemsMessage: 'ok',
    noAddToRecordMessage: 'ok',
    startCallMessage: 'ok',
    addNoteInPastMessage: 'ok'
  });

  this.render(hbs`
    {{care-record canAddToRecord=canAddToRecord
      canModifyExistingInRecord=canModifyExistingInRecord
      nextFutureFire=nextFutureFire
      personalPhoneNumber=personalPhoneNumber
      recordClusters=recordClusters
      numRecordItems=numRecordItems
      totalNumRecordItems=totalNumRecordItems
      images=images
      contents=contents
      doRegister=doRegister
      onEditNote=onEditNote
      onRestoreNote=onRestoreNote
      onViewNoteHistory=onViewNoteHistory
      onLoadRecordItems=onLoadRecordItems
      onRefreshRecordItems=onRefreshRecordItems
      onViewScheduledMessages=onViewScheduledMessages
      onContentChange=onContentChange
      onAddImage=onAddImage
      onRemoveImage=onRemoveImage
      onAddNote=onAddNote
      onCall=onCall
      onText=onText
      onScheduleMessage=onScheduleMessage
      noRecordItemsMessage=noRecordItemsMessage
      noAddToRecordMessage=noAddToRecordMessage
      startCallMessage=startCallMessage
      addNoteInPastMessage=addNoteInPastMessage}}
  `);

  assert.ok(this.$('.care-record').length, 'did render');
});

test('overlay messages', function(assert) {
  const noRecordItemsMessage = `${Math.random()}`,
    noAddToRecordMessage = `${Math.random()}`,
    startCallMessage = `${Math.random()}`,
    addNoteInPastMessage = `${Math.random()}`;
  this.setProperties({
    noRecordItemsMessage,
    noAddToRecordMessage,
    startCallMessage,
    addNoteInPastMessage
  });

  this.render(hbs`
    {{care-record noRecordItemsMessage=noRecordItemsMessage
      noAddToRecordMessage=noAddToRecordMessage
      startCallMessage=startCallMessage
      addNoteInPastMessage=addNoteInPastMessage}}
  `);

  const text = this.$().text();
  assert.ok(text.includes(noRecordItemsMessage));
  assert.ok(text.includes(noAddToRecordMessage));
  assert.ok(text.includes(startCallMessage));
  assert.ok(text.includes(addNoteInPastMessage));
});

test('doRegister a reference to the public API', function(assert) {
  const doRegister = sinon.spy();
  this.setProperties({ doRegister });

  this.render(hbs`{{care-record doRegister=doRegister}}`);

  assert.ok(this.$('.care-record').length, 'did render');
  assert.ok(doRegister.calledOnce);
  assert.equal(doRegister.firstCall.args.length, 1);
  assert.equal(
    typeOf(doRegister.firstCall.args[0]),
    'object',
    'is a public API, not component itself'
  );
  assert.equal(typeOf(doRegister.firstCall.args[0].actions.reset), 'object');
});

test('cannot add to record', function(assert) {
  this.setProperties({ canAddToRecord: false });

  this.render(hbs`{{care-record canAddToRecord=canAddToRecord}}`);

  assert.ok(this.$('.care-record').length, 'did render');
  assert.equal(this.$('.record-actions-control__overlay--open').length, 1);

  this.setProperties({ canAddToRecord: true });

  assert.notOk(this.$('.record-actions-control__overlay--open').length, 'overlay closed');
});

test('no items yet in the record', function(assert) {
  const noRecordItemsMessage = `${Math.random()}`;
  this.setProperties({ recordClusters: [], noRecordItemsMessage });

  this.render(
    hbs`{{care-record recordClusters=recordClusters noRecordItemsMessage=noRecordItemsMessage}}`
  );

  assert.ok(this.$('.care-record').length, 'did render');
  let text = this.$().text();
  assert.ok(text.includes(noRecordItemsMessage));

  this.set('recordClusters', [RecordCluster.create()]);

  text = this.$().text();
  assert.notOk(text.includes(noRecordItemsMessage), 'no items message not displayed');
});

// displays overlay + resets scroll position
test('starting call', function(assert) {
  const recordClusters = mockRecordClusters(store),
    onCall = sinon.spy(),
    personalPhoneNumber = `${Math.random()}`,
    done = assert.async();
  this.setProperties({ recordClusters, onCall, personalPhoneNumber });

  this.render(hbs`
    {{care-record canAddToRecord=true
      canModifyExistingInRecord=true
      recordClusters=recordClusters
      personalPhoneNumber=personalPhoneNumber
      onCall=onCall}}
  `);

  assert.ok(this.$('.care-record').length, 'did render');
  assert.equal(
    this.$('.record-cluster__item').length,
    recordClusters.length,
    'all single-item clusters rendered'
  );
  assert.notOk(Ember.$('.hide-away-body').length, 'dropdown is closed');

  this.$('.record-actions-control__action-container .hide-away-trigger')
    .first()
    .triggerHandler('mousedown');
  Ember.run.later(() => {
    const originalScrollPosition = this.$('.care-record__body').scrollTop();
    assert.ok(originalScrollPosition > 0, 'scroll is all the way at bottom');
    this.$('.care-record__body').scrollTop(0); // scroll record to top

    assert.ok(Ember.$('.hide-away-body').length, 'dropdown is open');
    assert.equal(Ember.$('.hide-away-body .dropdown-item').length, 4, 'all four actions available');
    assert.notOk(this.$('.record-actions-control__overlay--open').length, 'no overlays open');

    Ember.$('.hide-away-body .dropdown-item')
      .eq(1)
      .triggerHandler('click');
    Ember.run.later(() => {
      assert.ok(onCall.calledOnce);
      assert.equal(this.$('.record-actions-control__overlay--open').length, 1, '1 overlay open');

      let callOverlayText = this.$('.record-actions-control__overlay--open').text();
      assert.ok(
        callOverlayText.includes(personalPhoneNumber),
        'default message shows personal phone number'
      );

      assert.equal(
        this.$('.care-record__body').scrollTop(),
        originalScrollPosition,
        'scroll position is reset'
      );

      done();
    }, 500);
  }, 500);
});

// resets scroll position
test('sending text', function(assert) {
  const recordClusters = mockRecordClusters(store),
    onText = sinon.spy(),
    contents = `${Math.random()}`,
    done = assert.async();
  this.setProperties({ recordClusters, onText, contents });

  this.render(hbs`
    {{care-record canAddToRecord=true
      canModifyExistingInRecord=true
      recordClusters=recordClusters
      contents=contents
      onText=onText}}
  `);

  assert.ok(this.$('.care-record').length, 'did render');
  assert.equal(
    this.$('.record-cluster__item').length,
    recordClusters.length,
    'all single-item clusters rendered'
  );
  assert.notOk(
    this.$('.compose-text .action-button:disabled').length,
    'send text button is NOT disabled'
  );
  assert.ok(this.$('.compose-text .action-button').length, 'send text button is ACTIVE');

  Ember.run.later(() => {
    const originalScrollPosition = this.$('.care-record__body').scrollTop();
    assert.ok(originalScrollPosition > 0, 'scroll is all the way at bottom');
    this.$('.care-record__body').scrollTop(0); // scroll record to top

    this.$('.compose-text .action-button')
      .first()
      .click();
    wait().then(() => {
      assert.ok(onText.calledOnce);
      assert.equal(
        this.$('.care-record__body').scrollTop(),
        originalScrollPosition,
        'scroll position is reset'
      );

      done();
    });
  }, 500);
});

test('adding note in the past + cannot modify existing', function(assert) {
  const recordClusters = mockRecordClusters(store, 40, 'record-note', { noteContents: 'hi' }),
    done = assert.async();
  this.setProperties({ recordClusters, canModifyExistingInRecord: true });

  this.render(hbs`
    {{care-record canAddToRecord=true
      canModifyExistingInRecord=canModifyExistingInRecord
      recordClusters=recordClusters}}
  `);

  assert.ok(this.$('.care-record').length, 'did render');
  assert.notOk(Ember.$('.hide-away-body').length, 'dropdown is closed');
  assert.equal(
    this.$('.record-cluster__item').length,
    recordClusters.length,
    'all single-item clusters rendered'
  );
  assert.equal(this.$('.record-item--note').length, recordClusters.length, 'all items are notes');

  this.$('.record-actions-control__action-container .hide-away-trigger')
    .first()
    .triggerHandler('mousedown');
  Ember.run.later(() => {
    assert.ok(Ember.$('.hide-away-body').length, 'dropdown is open');
    assert.equal(
      Ember.$('.hide-away-body .dropdown-item').length,
      3,
      'three of four options because no phone number provided'
    );
    assert.notOk(this.$('.record-actions-control__overlay--open').length, 'no overlays open');
    assert.notOk(this.$('.care-record__add-note-button').length, 'no add buttons shown');

    Ember.$('.hide-away-body .dropdown-item')
      .eq(1) // with three items, the second one is to add note in the past
      .triggerHandler('click');
    Ember.run.later(() => {
      assert.equal(
        this.$('.care-record__add-note-button').length,
        recordClusters.length,
        'add buttons displayed, one for each single-item cluster'
      );
      assert.equal(
        $('.record-item--note .hide-away-trigger').length,
        recordClusters.length,
        'each rendered note has a dropdown menu'
      );

      this.set('canModifyExistingInRecord', false);

      assert.notOk(
        $('.record-item--note .hide-away-trigger').length,
        'if cannot modify existing in record + no revisions, note dropdown menus are hidden'
      );

      done();
    }, 500);
  }, 500);
});
