import * as LocationUtils from 'textup-frontend/utils/location';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';
import { VALID_IMAGE_DATA_URL } from 'textup-frontend/tests/helpers/utilities';

const { run } = Ember;

moduleForComponent(
  'record-cluster/item/note',
  'Integration | Component | record cluster/item/note',
  {
    integration: true
  }
);

test('mandatory inputs', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      rItem = store.createRecord('record-item'),
      rNote = store.createRecord('record-note');
    this.setProperties({ rItem, rNote });

    assert.throws(() => this.render(hbs`{{record-cluster/item/note}}`), 'requires note');
    assert.throws(() => this.render(hbs`{{record-cluster/item/note note=rItem}}`), 'requires note');

    this.render(hbs`{{record-cluster/item/note note=rNote}}`);

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

    assert.throws(() =>
      this.render(hbs`
      {{record-cluster/item/note note=rNote
        onEdit=onEdit
        onRestore=onRestore
        onViewHistory=onViewHistory}}
    `)
    );

    const noOp = () => null;
    this.setProperties({ rNote, onEdit: noOp, onRestore: noOp, onViewHistory: noOp });

    this.render(hbs`
      {{record-cluster/item/note note=rNote
        onEdit=onEdit
        onRestore=onRestore
        onViewHistory=onViewHistory}}
    `);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);
    assert.ok(this.$('.record-item__metadata').length);
  });
});

test('displaying empty note', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      rNote = store.createRecord('record-note'),
      done = assert.async();

    this.setProperties({ rNote });
    this.render(hbs`{{record-cluster/item/note note=rNote}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);

    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.notOk(this.$('.image-stack').length, 'no images');
    assert.notOk(this.$('.location-preview').length, 'no location');
    assert.ok(this.$('.record-item__controls').length, 'has dropdown with note controls');
    assert.notOk(Ember.$('.hide-away-body').length, 'dropdown is closed');

    this.$('.record-item__controls .hide-away-trigger')
      .first()
      .triggerHandler('mousedown');

    Ember.run.later(() => {
      assert.ok(Ember.$('.hide-away-body').length, 'dropdown is open');

      const dropdownText = Ember.$('.hide-away-body').text();
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
        media: store.createRecord('media')
      }),
      buildUrlStub = sinon
        .stub(LocationUtils, 'buildPreviewUrl')
        .callsFake(() => 'https://via.placeholder.com/5x5');
    rNote.get('media.content').addChange('image/png', VALID_IMAGE_DATA_URL, 77, 88);

    this.setProperties({ rNote });
    this.render(hbs`{{record-cluster/item/note note=rNote}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);
    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.ok(this.$('.image-stack').length, 'has images');
    assert.ok(this.$('.location-preview').length, 'has location');
    assert.ok(this.$('.record-item__controls').length, 'has dropdown with note controls');
    assert.notOk(Ember.$('.hide-away-body').length, 'dropdown is closed');
    assert.ok(
      this.$()
        .text()
        .trim()
        .includes(rNote.get('noteContents')),
      "displays note's contents"
    );

    buildUrlStub.restore();
  });
});

test('displaying note with revisions + actions', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      rNote = store.createRecord('record-note', {
        _revisions: [store.createRecord('record-note-revision')]
      }),
      onEdit = sinon.spy(),
      onViewHistory = sinon.spy(),
      done = assert.async();

    this.setProperties({ rNote, onEdit, onViewHistory });
    this.render(
      hbs`{{record-cluster/item/note note=rNote onEdit=onEdit onViewHistory=onViewHistory}}`
    );

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);
    assert.ok(this.$('.record-item__controls').length, 'has dropdown with note controls');
    assert.notOk(Ember.$('.hide-away-body').length, 'dropdown is closed');

    this.$('.record-item__controls .hide-away-trigger')
      .first()
      .triggerHandler('mousedown');

    wait()
      .then(() => {
        assert.ok(Ember.$('.hide-away-body').length, 'dropdown is open');
        assert.ok(Ember.$('.hide-away-body li').length === 2, 'dropdown body has two items');
        assert.ok(onEdit.notCalled);
        assert.ok(onViewHistory.notCalled);

        const dropdownText = Ember.$('.hide-away-body').text();
        assert.ok(dropdownText.includes('Edit'), 'can edit');
        assert.notOk(dropdownText.includes('Restore'), 'no restore');
        assert.ok(dropdownText.includes('history'), 'can view revisions');

        Ember.$('.hide-away-body li')
          .first()
          .triggerHandler('click'); // click edit
        return wait();
      })
      .then(() => {
        assert.ok(onEdit.calledOnce);
        assert.ok(onViewHistory.notCalled);

        Ember.$('.hide-away-body li')
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
        _revisions: [store.createRecord('record-note-revision')]
      }),
      onRestore = sinon.spy(),
      onViewHistory = sinon.spy(),
      done = assert.async();

    this.setProperties({ rNote, onRestore, onViewHistory });
    this.render(
      hbs`{{record-cluster/item/note note=rNote onRestore=onRestore onViewHistory=onViewHistory}}`
    );

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);
    assert.ok(this.$('.record-item__controls').length, 'has dropdown with note controls');
    assert.notOk(Ember.$('.hide-away-body').length, 'dropdown is closed');

    this.$('.record-item__controls .hide-away-trigger')
      .first()
      .triggerHandler('mousedown');

    wait()
      .then(() => {
        assert.ok(Ember.$('.hide-away-body').length, 'dropdown is open');
        assert.ok(Ember.$('.hide-away-body li').length === 2, 'dropdown body has two items');
        assert.ok(onRestore.notCalled);
        assert.ok(onViewHistory.notCalled);

        const dropdownText = Ember.$('.hide-away-body').text();
        assert.notOk(dropdownText.includes('Edit'), 'no edit');
        assert.ok(dropdownText.includes('Restore'), 'can restore');
        assert.ok(dropdownText.includes('history'), 'can view revisions');

        Ember.$('.hide-away-body li')
          .first()
          .triggerHandler('click'); // click restore
        return wait();
      })
      .then(() => {
        assert.ok(onRestore.calledOnce);
        assert.ok(onViewHistory.notCalled);

        Ember.$('.hide-away-body li')
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
        _revisions: [store.createRecord('record-note-revision')]
      }),
      onViewHistory = sinon.spy(),
      done = assert.async();

    this.setProperties({ rNote, onViewHistory });
    this.render(
      hbs`{{record-cluster/item/note note=rNote readOnly=true onViewHistory=onViewHistory}}`
    );

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);
    assert.ok(this.$('.record-item__controls').length, 'has dropdown with note controls');
    assert.notOk(Ember.$('.hide-away-body').length, 'dropdown is closed');

    this.$('.record-item__controls .hide-away-trigger')
      .first()
      .triggerHandler('mousedown');

    wait()
      .then(() => {
        assert.ok(Ember.$('.hide-away-body').length, 'dropdown is open');
        assert.ok(Ember.$('.hide-away-body li').length === 1, 'dropdown body has one items');
        assert.ok(onViewHistory.notCalled);

        const dropdownText = Ember.$('.hide-away-body').text();
        assert.notOk(dropdownText.includes('Edit'), 'no edit');
        assert.notOk(dropdownText.includes('Restore'), 'no restore');
        assert.ok(dropdownText.includes('history'), 'can view revisions');

        Ember.$('.hide-away-body li')
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
    this.render(hbs`{{record-cluster/item/note note=rNote readOnly=true}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--note').length);
    assert.notOk(
      this.$('.record-item__controls').length,
      'no dropdown if readOnly and no revisions'
    );
  });
});
