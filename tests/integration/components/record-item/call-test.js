import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';
import { VALID_IMAGE_DATA_URL } from 'textup-frontend/tests/helpers/utilities';

const { run } = Ember;
let store;

moduleForComponent('record-item/call', 'Integration | Component | record item/call', {
  integration: true,
  beforeEach() {
    store = Ember.getOwner(this).lookup('service:store');
  }
});

test('inputs', function(assert) {
  run(() => {
    const rItem = store.createRecord('record-item'),
      rCall = store.createRecord('record-call', { outgoing: true }),
      done = assert.async();
    this.setProperties({ rItem, rCall });

    assert.throws(() => this.render(hbs`{{record-item/call}}`), 'requires call');
    assert.throws(() => this.render(hbs`{{record-item/call call=rItem}}`), 'requires call');

    this.render(hbs`{{record-item/call call=rCall}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--call').length);
    assert.ok(this.$('.record-item__metadata').length);
    assert.ok(this.$('.record-item__receipts').length, 'has receipts tray');
    assert.ok(
      this.$('.record-item__receipts--disabled').length,
      'tray disabled because no receipts'
    );

    rCall.set('receipts', { success: ['1112223333'] });

    wait()
      .then(() => {
        assert.ok(this.$('.record-item__receipts').length, 'has receipts tray');
        assert.notOk(
          this.$('.record-item__receipts--disabled').length,
          'tray enabled because has receipts'
        );

        rCall.set('outgoing', false);
        return wait();
      })
      .then(() => {
        assert.ok(
          this.$('.record-item__receipts--disabled').length,
          'receipts disabled when incoming'
        );
        done();
      });
  });
});

test('finished call', function(assert) {
  run(() => {
    const rCall = store.createRecord('record-call', {
      durationInSeconds: 88
    });
    this.setProperties({ rCall });

    this.render(hbs`{{record-item/call call=rCall}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--call').length);
    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.notOk(this.$('.image-stack').length, 'no images');
    assert.notOk(this.$('.audio-control').length, 'no voicemail');

    const text = this.$().text();
    assert.ok(text.includes('lasting'), 'is finished when we get passed the duration in seconds');
    assert.notOk(text.includes(rCall.get('durationInSeconds')), 'duration in seconds is humanized');
  });
});

test('in-progress call', function(assert) {
  run(() => {
    const rCall = store.createRecord('record-call', {
      whenCreated: new Date(Date.now())
    });
    this.setProperties({ rCall });

    this.render(hbs`{{record-item/call call=rCall}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--call').length);
    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.notOk(this.$('.image-stack').length, 'no images');
    assert.notOk(this.$('.audio-control').length, 'no voicemail');

    const text = this.$().text();
    assert.ok(text.includes('in progress'), 'in progress = created today + no success');
  });
});

test('failed call', function(assert) {
  run(() => {
    const rCall = store.createRecord('record-call', {
      whenCreated: new Date(Math.floor(Date.now() / 2))
    });
    this.setProperties({ rCall });

    this.render(hbs`{{record-item/call call=rCall}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--call').length);
    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.notOk(this.$('.image-stack').length, 'no images');
    assert.notOk(this.$('.audio-control').length, 'no voicemail');

    const text = this.$().text();
    assert.ok(text.includes('could not'), 'failed = created before today + no success');
  });
});

test('call with notes and media', function(assert) {
  run(() => {
    const rCall = store.createRecord('record-call', {
      noteContents: `${Math.random()}`,
      media: store.createRecord('media')
    });
    rCall.get('media.content').addImage('image/png', VALID_IMAGE_DATA_URL, 77, 88);
    this.setProperties({ rCall });

    this.render(hbs`{{record-item/call call=rCall}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--call').length);
    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.ok(this.$('.image-stack').length, 'has images');
    assert.notOk(this.$('.audio-control').length, 'no voicemail');

    const text = this.$().text();
    assert.ok(text.includes(rCall.get('noteContents')), 'note contents rendered');
  });
});

test('voicemail', function(assert) {
  run(() => {
    const rCall = store.createRecord('record-call', {
      hasVoicemail: true,
      voicemailUrl: 'http://www.example.com'
    });
    this.setProperties({ rCall });

    this.render(hbs`{{record-item/call call=rCall}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--call').length);
    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.notOk(this.$('.image-stack').length, 'no images');
    assert.ok(this.$('.audio-control').length, 'has voicemail');
  });
});
