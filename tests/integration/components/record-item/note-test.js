import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import LocationUtils from 'textup-frontend/utils/location';
import moment from 'moment';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';
import { VALID_IMAGE_DATA_URL } from 'textup-frontend/tests/helpers/utilities';

const { run } = Ember;

moduleForComponent('record-item/note', 'Integration | Component | record item/note', {
  integration: true,
});

test('mandatory inputs', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      rItem = store.createRecord('record-item'),
      rNote = store.createRecord('record-note');
    this.setProperties({ rItem, rNote });

    this.render(hbs`{{record-item/note note=rNote}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);
    assert.ok(this.$('.record-item__metadata').length);
  });
});

test('optional inputs', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      rNote = store.createRecord('record-note');
    this.setProperties({ rNote, onEdit: '', onRestore: '', onViewHistory: '' });

    const noOp = () => null;
    this.setProperties({ rNote, onEdit: noOp, onRestore: noOp, onViewHistory: noOp });

    this.render(hbs`
      {{record-item/note note=rNote
        onEdit=onEdit
        onRestore=onRestore
        onViewHistory=onViewHistory}}
    `);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);
    assert.ok(this.$('.record-item__metadata').length);
  });
});

test('timestamp displayed is `whenChanged` not `whenCreated`', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      whenChanged = new Date(),
      rNote = store.createRecord('record-note', { whenCreated: null, whenChanged });

    this.setProperties({ rNote });
    this.render(hbs`{{record-item/note note=rNote}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);
    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.ok(
      this.$('.record-item__metadata')
        .text()
        .indexOf(moment(whenChanged).format(config.moment.outputFormat)) > -1
    );
  });
});

test('displaying empty note', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      rNote = store.createRecord('record-note'),
      done = assert.async();

    this.setProperties({ rNote });
    this.render(hbs`{{record-item/note note=rNote}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);

    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.notOk(this.$('.image-stack').length, 'no images');
    assert.notOk(this.$('.audio-wrapper__player-item').length, 'no images');
    assert.notOk(this.$('.location-preview').length, 'no location');
    assert.ok(this.$('.record-item__control').length, 'has dropdown with note controls');
    assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown is closed');

    const text = this.$()
      .text()
      .toLowerCase();
    assert.ok(text.includes('no note contents'), 'if no note contents has a informational message');

    this.$('.record-item__control button')
      .first()
      .triggerHandler('click');

    Ember.run.later(() => {
      assert.ok(Ember.$('.pop-over__body--open').length, 'dropdown is open');

      const dropdownText = Ember.$('.pop-over__body--open').text();
      assert.ok(dropdownText.includes('Edit'), 'can edit');
      assert.notOk(dropdownText.includes('Restore'), 'no restore');
      assert.notOk(dropdownText.includes('history'), 'no revisions');

      done();
    }, 1000);
  });
});

test('display note with note contents, media, and location', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      rNote = store.createRecord('record-note', {
        noteContents: `${Math.random()}`,
        location: store.createRecord('location', { latLng: { lat: 0, lng: 0 } }),
        media: store.createRecord('media'),
      }),
      buildUrlStub = sinon
        .stub(LocationUtils, 'buildPreviewUrl')
        .callsFake(() => 'https://via.placeholder.com/5x5');
    rNote.get('media.content').addImage('image/png', VALID_IMAGE_DATA_URL, 77, 88);

    this.setProperties({ rNote });
    this.render(hbs`{{record-item/note note=rNote}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);
    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.notOk(
      this.$('.image-stack').length,
      'do not show images it being edited to avoid too many request while editing'
    );
    assert.notOk(
      this.$('.audio-wrapper__player-item').length,
      'do not show audio it being edited to avoid too many request while editing'
    );
    assert.notOk(
      this.$('.location-preview').length,
      'do not show location it being edited to avoid too many request while editing'
    );
    assert.ok(this.$('.record-item__control').length, 'has dropdown with note controls');
    assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown is closed');

    const text = this.$()
      .text()
      .toLowerCase();
    assert.notOk(text.includes('no note contents'), 'no informational message since has contents');
    assert.ok(text.includes(rNote.get('noteContents')), "displays note's contents");

    buildUrlStub.restore();
  });
});

test('displaying note with revisions + actions', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      rNote = store.createRecord('record-note', {
        _revisions: [store.createRecord('record-note-revision')],
      }),
      onEdit = sinon.spy(),
      onViewHistory = sinon.spy(),
      done = assert.async();

    this.setProperties({ rNote, onEdit, onViewHistory });
    this.render(hbs`{{record-item/note note=rNote onEdit=onEdit onViewHistory=onViewHistory}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);
    assert.ok(this.$('.record-item__control').length, 'has dropdown with note controls');
    assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown is closed');

    this.$('.record-item__control button')
      .first()
      .triggerHandler('click');

    wait()
      .then(() => {
        assert.ok(Ember.$('.pop-over__body--open').length, 'dropdown is open');
        assert.ok(Ember.$('.pop-over__body--open li').length === 2, 'dropdown body has two items');
        assert.ok(onEdit.notCalled);
        assert.ok(onViewHistory.notCalled);

        const dropdownText = Ember.$('.pop-over__body--open').text();
        assert.ok(dropdownText.includes('Edit'), 'can edit');
        assert.notOk(dropdownText.includes('Restore'), 'no restore');
        assert.ok(dropdownText.includes('history'), 'can view revisions');

        Ember.$('.pop-over__body--open li')
          .first()
          .triggerHandler('click'); // click edit
        return wait();
      })
      .then(() => {
        assert.ok(onEdit.calledOnce);
        assert.ok(onViewHistory.notCalled);

        Ember.$('.pop-over__body--open li')
          .eq(1)
          .triggerHandler('click'); // click view history
        return wait();
      })
      .then(() => {
        assert.ok(onEdit.calledOnce);
        assert.ok(onViewHistory.calledOnce);

        done();
      });
  });
});

test('displaying deleted note with revisions + actions', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      rNote = store.createRecord('record-note', {
        hasBeenDeleted: true,
        _revisions: [store.createRecord('record-note-revision')],
      }),
      onRestore = sinon.spy(),
      onViewHistory = sinon.spy(),
      done = assert.async();

    this.setProperties({ rNote, onRestore, onViewHistory });
    this.render(
      hbs`{{record-item/note note=rNote onRestore=onRestore onViewHistory=onViewHistory}}`
    );

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);
    assert.ok(this.$('.record-item__control').length, 'has dropdown with note controls');
    assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown is closed');

    this.$('.record-item__control button')
      .first()
      .triggerHandler('click');

    wait()
      .then(() => {
        assert.ok(Ember.$('.pop-over__body--open').length, 'dropdown is open');
        assert.ok(Ember.$('.pop-over__body--open li').length === 2, 'dropdown body has two items');
        assert.ok(onRestore.notCalled);
        assert.ok(onViewHistory.notCalled);

        const dropdownText = Ember.$('.pop-over__body--open').text();
        assert.notOk(dropdownText.includes('Edit'), 'no edit');
        assert.ok(dropdownText.includes('Restore'), 'can restore');
        assert.ok(dropdownText.includes('history'), 'can view revisions');

        Ember.$('.pop-over__body--open li')
          .first()
          .triggerHandler('click'); // click restore
        return wait();
      })
      .then(() => {
        assert.ok(onRestore.calledOnce);
        assert.ok(onViewHistory.notCalled);

        Ember.$('.pop-over__body--open li')
          .eq(1)
          .triggerHandler('click'); // click view history
        return wait();
      })
      .then(() => {
        assert.ok(onRestore.calledOnce);
        assert.ok(onViewHistory.calledOnce);

        done();
      });
  });
});

test('readonly mode with revisions + actions', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      rNote = store.createRecord('record-note', {
        _revisions: [store.createRecord('record-note-revision')],
      }),
      onViewHistory = sinon.spy(),
      done = assert.async();

    this.setProperties({ rNote, onViewHistory });
    this.render(hbs`{{record-item/note note=rNote readOnly=true onViewHistory=onViewHistory}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);
    assert.ok(this.$('.record-item__control').length, 'has dropdown with note controls');
    assert.notOk(Ember.$('.pop-over__body--open').length, 'dropdown is closed');

    this.$('.record-item__control button')
      .first()
      .triggerHandler('click');

    wait()
      .then(() => {
        assert.ok(Ember.$('.pop-over__body--open').length, 'dropdown is open');
        assert.ok(Ember.$('.pop-over__body--open li').length === 1, 'dropdown body has one items');
        assert.ok(onViewHistory.notCalled);

        const dropdownText = Ember.$('.pop-over__body--open').text();
        assert.notOk(dropdownText.includes('Edit'), 'no edit');
        assert.notOk(dropdownText.includes('Restore'), 'no restore');
        assert.ok(dropdownText.includes('history'), 'can view revisions');

        Ember.$('.pop-over__body--open li')
          .first()
          .triggerHandler('click'); // click restore
        return wait();
      })
      .then(() => {
        assert.ok(onViewHistory.calledOnce);

        done();
      });
  });
});

test('readonly mode without revisions', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      rNote = store.createRecord('record-note');

    this.setProperties({ rNote });
    this.render(hbs`{{record-item/note note=rNote readOnly=true}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);
    assert.notOk(
      this.$('.record-item__control').length,
      'no dropdown if readOnly and no revisions'
    );
  });
});
