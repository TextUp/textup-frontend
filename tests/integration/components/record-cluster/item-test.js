import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { run } = Ember;
let store;

moduleForComponent('record-cluster/item', 'Integration | Component | record cluster/item', {
  integration: true,
  beforeEach() {
    store = Ember.getOwner(this).lookup('service:store');
  }
});

test('inputs', function(assert) {
  run(() => {
    const rItem = store.createRecord('record-item'),
      rCall = store.createRecord('record-call'),
      validNoteOpts = {},
      invalidNoteOpts = 'hi';
    this.setProperties({ rItem, rCall, validNoteOpts, invalidNoteOpts });

    assert.throws(() => this.render(hbs`{{record-cluster/item}}`), 'requires item or subclass');

    this.render(hbs`{{record-cluster/item item=rItem}}`);

    assert.ok(this.$('.record-cluster__item').length, 'did render');

    this.render(hbs`{{record-cluster/item item=rCall noteOptions=validNoteOpts}}`);

    assert.ok(this.$('.record-cluster__item').length, 'did render');

    assert.throws(
      () => this.render(hbs`{{record-cluster/item item=rCall noteOptions=invalidNoteOpts}}`),
      'if specified, note options must be an object'
    );
  });
});

test('rendering generic item', function(assert) {
  run(() => {
    const rItem = store.createRecord('record-item');
    this.setProperties({ rItem });

    this.render(hbs`{{record-cluster/item item=rItem}}`);

    assert.equal(
      this.$()
        .text()
        .trim(),
      '',
      'renders nothing for generic items'
    );
  });
});

test('rendering text', function(assert) {
  run(() => {
    const rText = store.createRecord('record-text', { outgoing: false }),
      done = assert.async();
    this.setProperties({ rText });

    this.render(hbs`{{record-cluster/item item=rText}}`);

    assert.ok(this.$('.record-cluster__item').length, 'did render');
    assert.ok(this.$('.record-item.record-item--text').length, 'is a text');

    assert.ok(this.$('.record-cluster__item--incoming').length, 'incoming');
    assert.notOk(this.$('.record-cluster__item--outgoing').length, 'not outgoing');
    assert.notOk(this.$('.record-cluster__item--internal').length, 'not internal');

    rText.set('outgoing', true);

    wait().then(() => {
      assert.notOk(this.$('.record-cluster__item--incoming').length, 'not incoming');
      assert.ok(this.$('.record-cluster__item--outgoing').length, 'outgoing');
      assert.notOk(this.$('.record-cluster__item--internal').length, 'not internal');

      done();
    });
  });
});

test('rendering call', function(assert) {
  run(() => {
    const rCall = store.createRecord('record-call', { outgoing: false }),
      done = assert.async();
    this.setProperties({ rCall });

    this.render(hbs`{{record-cluster/item item=rCall}}`);

    assert.ok(this.$('.record-cluster__item').length, 'did render');
    assert.ok(this.$('.record-item.record-item--call').length, 'is a call');

    assert.ok(this.$('.record-cluster__item--incoming').length, 'incoming');
    assert.notOk(this.$('.record-cluster__item--outgoing').length, 'not outgoing');
    assert.notOk(this.$('.record-cluster__item--internal').length, 'not internal');

    rCall.set('outgoing', true);

    wait().then(() => {
      assert.notOk(this.$('.record-cluster__item--incoming').length, 'not incoming');
      assert.ok(this.$('.record-cluster__item--outgoing').length, 'outgoing');
      assert.notOk(this.$('.record-cluster__item--internal').length, 'not internal');

      done();
    });
  });
});

test('rendering user-defined note', function(assert) {
  run(() => {
    const rNote = store.createRecord('record-note', { isReadOnly: false, outgoing: false }),
      done = assert.async();
    this.setProperties({ rNote });

    this.render(hbs`{{record-cluster/item item=rNote}}`);

    assert.ok(this.$('.record-cluster__item').length, 'did render');
    assert.ok(this.$('.record-item.record-item--note').length, 'is a user-defined note');

    assert.notOk(this.$('.record-cluster__item--incoming').length, 'not incoming');
    assert.notOk(this.$('.record-cluster__item--outgoing').length, 'not outgoing');
    assert.ok(this.$('.record-cluster__item--internal').length, 'is internal');

    rNote.set('outgoing', true);

    wait().then(() => {
      assert.notOk(this.$('.record-cluster__item--incoming').length, 'not incoming');
      assert.notOk(this.$('.record-cluster__item--outgoing').length, 'not outgoing');
      assert.ok(this.$('.record-cluster__item--internal').length, 'is internal');

      done();
    });
  });
});

test('rendering system-defined note', function(assert) {
  run(() => {
    const rNote = store.createRecord('record-note', { isReadOnly: true, outgoing: false }),
      done = assert.async();
    this.setProperties({ rNote });

    this.render(hbs`{{record-cluster/item item=rNote}}`);

    assert.ok(this.$('.record-cluster__item').length, 'did render');
    assert.ok(this.$('.record-item.record-item--system-message').length, 'is a system-message');

    assert.notOk(this.$('.record-cluster__item--incoming').length, 'not incoming');
    assert.notOk(this.$('.record-cluster__item--outgoing').length, 'not outgoing');
    assert.ok(this.$('.record-cluster__item--internal').length, 'is internal');

    rNote.set('outgoing', true);

    wait().then(() => {
      assert.notOk(this.$('.record-cluster__item--incoming').length, 'not incoming');
      assert.notOk(this.$('.record-cluster__item--outgoing').length, 'not outgoing');
      assert.ok(this.$('.record-cluster__item--internal').length, 'is internal');

      done();
    });
  });
});
