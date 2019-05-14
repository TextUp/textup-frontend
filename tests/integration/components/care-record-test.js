import * as AliasModelNameInitializer from 'textup-frontend/initializers/alias-model-name';
import CareRecordComponent from 'textup-frontend/components/care-record';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { mockRecordClusters } from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';

const { typeOf, run } = Ember;

moduleForComponent('care-record', 'Integration | Component | care record', {
  integration: true,
  beforeEach() {
    AliasModelNameInitializer.aliasModelName();
    this.inject.service('store');
  },
  afterEach() {
    AliasModelNameInitializer.cleanUpModelNameAlias();
  },
});

test('empty + invalid inputs', function(assert) {
  this.render(hbs`{{care-record}}`);

  assert.ok(this.$('.care-record').length, 'no inputs is ok');

  assert.throws(() => {
    this.render(hbs`
    {{care-record canAddToRecord=88
      canModifyExistingInRecord=88
      nextFutureFire=88
      personalNumber=88
      recordClusters=88
      numRecordItems="not a number"
      totalNumRecordItems="not a number"
      images=88
      audio=88
      contents=88
      doRegister=88
      onEndOngoingCall=88
      onEditNote=88
      onRestoreNote=88
      onViewNoteHistory=88
      onLoadRecordItems=88
      onRefreshRecordItems=88
      onViewScheduledMessages=88
      onContentChange=88
      onAddImage=88
      onAddAudio=88
      onRemoveMedia=88
      onAddNote=88
      onCall=88
      onText=88
      onScheduleMessage=88
      noRecordItemsMessage=88
      noAddToRecordMessage=88
      startCallMessage=88
      addNoteInPastMessage=88}}
  `);
  }, 'invalid types');
});

test('all valid inputs', function(assert) {
  this.setProperties({ date: new Date(), array: [], func: () => null });

  this.render(hbs`
    {{care-record canAddToRecord=true
      canModifyExistingInRecord=true
      nextFutureFire=date
      personalNumber="hi"
      recordClusters=array
      numRecordItems=88
      totalNumRecordItems=88
      images=array
      audio=array
      contents="hi"
      doRegister=func
      onEndOngoingCall=func
      onEditNote=func
      onRestoreNote=func
      onViewNoteHistory=func
      onLoadRecordItems=func
      onRefreshRecordItems=func
      onViewScheduledMessages=func
      onContentChange=func
      onAddImage=func
      onAddAudio=func
      onRemoveMedia=func
      onAddNote=func
      onCall=func
      onText=func
      onScheduleMessage=func
      noRecordItemsMessage="hi"
      noAddToRecordMessage="hi"
      startCallMessage="hi"
      addNoteInPastMessage="hi"}}
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
    addNoteInPastMessage,
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
  assert.equal(typeOf(doRegister.firstCall.args[0].actions.resetAll), 'function');
  assert.equal(typeOf(doRegister.firstCall.args[0].actions.restorePosition), 'function');
});

test('text handler returns outcome', function(assert) {
  const done = assert.async(),
    onText = sinon.spy(),
    obj = CareRecordComponent.create({ onText });

  obj._onText().then(() => {
    assert.ok(onText.calledOnce);

    done();
  });
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
  const recordClusters = mockRecordClusters(this.store),
    onCall = sinon.spy(),
    personalNumber = `${Math.random()}`,
    done = assert.async();
  this.setProperties({ recordClusters, onCall, personalNumber });

  this.render(hbs`
    {{care-record canAddToRecord=true
      canModifyExistingInRecord=true
      recordClusters=recordClusters
      personalNumber=personalNumber
      onCall=onCall}}
  `);

  assert.ok(this.$('.care-record').length, 'did render');
  assert.equal(
    this.$('.record-cluster__item').length,
    recordClusters.length,
    'all single-item clusters rendered'
  );
  assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown is closed');

  // open the dropdown
  this.$('.record-actions-control__action-container button')
    .first()
    .triggerHandler('click');
  run.later(() => {
    const originalScrollPosition = this.$('.infinite-scroll__scroll-container').scrollTop();
    assert.ok(originalScrollPosition > 0, 'scroll is all the way at bottom');
    this.$('.infinite-scroll__scroll-container').scrollTop(0); // scroll record to top

    assert.ok(Ember.$('.pop-over__body--open').length, 'dropdown is open');
    assert.equal(
      Ember.$('.pop-over__body--open .dropdown-item').length,
      4,
      'all four actions available'
    );
    assert.notOk(this.$('.record-actions-control__overlay--open').length, 'no overlays open');

    Ember.$('.pop-over__body--open .dropdown-item')
      .eq(1)
      .triggerHandler('click');
    run.later(() => {
      assert.ok(onCall.calledOnce);
      assert.equal(this.$('.record-actions-control__overlay--open').length, 1, '1 overlay open');

      let callOverlayText = this.$('.record-actions-control__overlay--open').text();
      assert.ok(
        callOverlayText.includes(personalNumber),
        'default message shows personal phone number'
      );
      assert.ok(
        this.$('.infinite-scroll__scroll-container').scrollTop() >= originalScrollPosition,
        'scroll position is reset'
      );

      done();
    }, 500);
  }, 500);
});

// resets scroll position
test('sending text', function(assert) {
  const recordClusters = mockRecordClusters(this.store),
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

  run.later(() => {
    const originalScrollPosition = this.$('.infinite-scroll__scroll-container').scrollTop();
    assert.ok(originalScrollPosition > 0, 'scroll is all the way at bottom');
    this.$('.infinite-scroll__scroll-container').scrollTop(0); // scroll record to top

    this.$('.compose-text .action-button')
      .first()
      .click();
    wait().then(() => {
      assert.ok(onText.calledOnce);
      assert.ok(
        this.$('.infinite-scroll__scroll-container').scrollTop() >= originalScrollPosition,
        'scroll position is reset'
      );

      done();
    });
  }, 500);
});

test('adding note in the past + cannot modify existing', function(assert) {
  const recordClusters = mockRecordClusters(this.store, 40, 'record-note', { noteContents: 'hi' }),
    done = assert.async();
  this.setProperties({ recordClusters, canModifyExistingInRecord: true });

  this.render(hbs`
    {{care-record canAddToRecord=true
      canModifyExistingInRecord=canModifyExistingInRecord
      recordClusters=recordClusters}}
  `);

  assert.ok(this.$('.care-record').length, 'did render');
  assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown is closed');
  assert.equal(
    this.$('.record-cluster__item').length,
    recordClusters.length,
    'all single-item clusters rendered'
  );
  assert.equal(this.$('.record-item--note').length, recordClusters.length, 'all items are notes');

  this.$('.record-actions-control__action-container button')
    .first()
    .triggerHandler('click');
  run.later(() => {
    assert.ok(Ember.$('.pop-over__body--open').length, 'dropdown is open');
    assert.equal(
      Ember.$('.pop-over__body--open .dropdown-item').length,
      3,
      'three of four options because no phone number provided'
    );
    assert.notOk(this.$('.record-actions-control__overlay--open').length, 'no overlays open');
    assert.notOk(this.$('.care-record__add-note__button').length, 'no add buttons shown');

    Ember.$('.pop-over__body--open .dropdown-item')
      .eq(1) // with three items, the second one is to add note in the past
      .triggerHandler('click');
    run.later(() => {
      assert.equal(
        this.$('.care-record__add-note__button').length,
        recordClusters.length,
        'add buttons displayed, one for each single-item cluster'
      );
      assert.equal(
        $('.record-item--note button').length,
        recordClusters.length,
        'each rendered note has a dropdown menu'
      );
      assert.ok(
        this.$('.record-actions-control__overlay--open').length,
        'adding note overlay is open'
      );

      this.set('canModifyExistingInRecord', false);

      assert.notOk(
        $('.record-item--note button').length,
        'if cannot modify existing in record + no revisions, note dropdown menus are hidden'
      );

      done();
    }, 500);
  }, 500);
});

test('adding note in the past', function(assert) {
  const recordClusters = mockRecordClusters(this.store, 40, 'record-note', { noteContents: 'hi' }),
    onAddNote = sinon.spy(),
    done = assert.async();
  this.setProperties({ recordClusters, onAddNote, canModifyExistingInRecord: true });

  this.render(hbs`
    {{care-record canAddToRecord=true
      canModifyExistingInRecord=canModifyExistingInRecord
      recordClusters=recordClusters
      onAddNote=onAddNote}}
  `);

  assert.ok(this.$('.care-record').length, 'did render');

  this.$('.record-actions-control__action-container button')
    .first()
    .triggerHandler('click');
  run.later(() => {
    assert.ok(Ember.$('.pop-over__body--open').length, 'dropdown is open');
    assert.equal(
      Ember.$('.pop-over__body--open .dropdown-item').length,
      3,
      'three of four options because no phone number provided'
    );
    assert.notOk(this.$('.record-actions-control__overlay--open').length, 'no overlays open');
    assert.notOk(this.$('.care-record__add-note__button').length, 'no add buttons shown');

    Ember.$('.pop-over__body--open .dropdown-item')
      .eq(1) // with three items, the second one is to add note in the past
      .triggerHandler('click');
    run.later(() => {
      assert.equal(
        this.$('.care-record__add-note__button').length,
        recordClusters.length,
        'add buttons displayed, one for each single-item cluster'
      );
      assert.equal(
        $('.record-item--note button').length,
        recordClusters.length,
        'each rendered note has a dropdown menu'
      );
      assert.ok(
        this.$('.record-actions-control__overlay--open').length,
        'adding note overlay is open'
      );

      this.$('.care-record__add-note__button')
        .first()
        .triggerHandler('click');
      run.later(() => {
        assert.notOk(this.$('.care-record__add-note__button').length, 'all buttons are hidden');
        assert.notOk(this.$('.record-actions-control__overlay--open').length, 'no overlays open');

        done();
      }, 500);
    }, 500);
  }, 500);
});

test('record item position is preserved with changing actions control height', function(assert) {
  const recordClusters = mockRecordClusters(this.store),
    done = assert.async();
  this.setProperties({ recordClusters });

  this.render(hbs`
    {{care-record canAddToRecord=true
      canModifyExistingInRecord=true
      recordClusters=recordClusters}}
  `);

  assert.ok(this.$('.care-record').length, 'did render');
  assert.ok(this.$('.record-actions-control').length);

  wait().then(() => {
    const originalScrollPosition = this.$('.infinite-scroll__scroll-container').scrollTop();
    assert.ok(originalScrollPosition > 0, 'scroll is all the way at bottom');
    // simulate changing height of the media drawer as if the record action control increased in height
    this.$('.infinite-scroll__scroll-container').height(50);
    // trigger mutation observers
    this.$('.record-actions-control').append('<div style="height: 100px;">Test</div>');
    run.later(() => {
      const newScrollPosition = this.$('.infinite-scroll__scroll-container').scrollTop();
      assert.ok(
        newScrollPosition !== originalScrollPosition,
        'scroll position adjusted based on actions container height change'
      );

      done();
    }, 1000);
  });
});

test('restoring user position after loading via public API', function(assert) {
  const doRegister = sinon.spy(),
    recordClusters = mockRecordClusters(this.store),
    moreClusters1 = mockRecordClusters(this.store),
    done = assert.async();
  this.setProperties({ doRegister, recordClusters });

  this.render(hbs`{{care-record doRegister=doRegister recordClusters=recordClusters}}`);
  assert.ok(this.$('.care-record').length, 'did render');
  assert.ok(doRegister.calledOnce);

  const $container = this.$('.infinite-scroll__scroll-container');
  let originalScrollPosition;
  // [IMPORTANT] need to wait first to allow the scroll-container to initialize its initial user offset
  wait()
    .then(() => {
      originalScrollPosition = $container.scrollTop();

      run(() => this.get('recordClusters').pushObjects(moreClusters1));
      return wait();
    })
    .then(() => {
      assert.ok(
        $container.scrollTop() > originalScrollPosition,
        'scroll position is restored automatically when the data array is added-to so the position changes'
      );

      done();
    });
});

test('resetting all scroll state via public API', function(assert) {
  const doRegister = sinon.spy(),
    recordClusters = mockRecordClusters(this.store),
    done = assert.async();
  this.setProperties({ doRegister, recordClusters });

  this.render(hbs`{{care-record doRegister=doRegister recordClusters=recordClusters}}`);
  assert.ok(this.$('.care-record').length, 'did render');
  assert.ok(doRegister.calledOnce);

  const publicAPI = doRegister.firstCall.args[0],
    $container = this.$('.infinite-scroll__scroll-container'),
    $content = this.$('.infinite-scroll__scroll-container__content');
  let originalScrollPosition;
  // [IMPORTANT] need to wait first to allow the scroll-container to initialize its initial user offset
  wait().then(() => {
    // scroll halfway and give time for the scroll handlers to propagate
    $container.scrollTop($content.outerHeight() / 2);
    setTimeout(() => {
      originalScrollPosition = $container.scrollTop();

      // then try to reset position
      publicAPI.actions.resetAll();
      wait().then(() => {
        assert.ok(
          $container.scrollTop() > originalScrollPosition,
          'scroll position is reset to very bottom'
        );

        done();
      });
    }, 1000);
  });
});
