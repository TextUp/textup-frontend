import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';
import { VALID_IMAGE_DATA_URL, VALID_MP3_URL_1 } from 'textup-frontend/tests/helpers/utilities';

let store;

moduleForComponent('record-item/text', 'Integration | Component | record item/text', {
  integration: true,
  beforeEach() {
    store = getOwner(this).lookup('service:store');
  },
});

test('inputs', function(assert) {
  run(() => {
    const rItem = store.createRecord('record-item'),
      rText = store.createRecord('record-text', { outgoing: true }),
      done = assert.async();
    this.setProperties({ rItem, rText });

    this.render(hbs`{{record-item/text text=rText}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--text').length);
    assert.ok(this.$('.record-item__metadata').length);
    assert.ok(this.$('.record-item__receipts').length, 'has receipts tray');
    assert.ok(
      this.$('.record-item__receipts--disabled').length,
      'tray disabled because no receipts'
    );

    rText.set('receipts', { success: ['1112223333'] });

    wait()
      .then(() => {
        assert.ok(this.$('.record-item__receipts').length, 'has receipts tray');
        assert.notOk(
          this.$('.record-item__receipts--disabled').length,
          'tray enabled because has receipts'
        );

        rText.set('outgoing', false);
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

test('text with only contents', function(assert) {
  run(() => {
    const rText = store.createRecord('record-text', {
      contents: `${Math.random()}`,
    });
    this.setProperties({ rText });

    this.render(hbs`{{record-item/text text=rText}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--text').length);

    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.notOk(this.$('.image-stack').length, 'no images');
    assert.notOk(this.$('.record-item__media--audio').length, 'no audio');
    assert.ok(this.$('.record-item__receipts').length, 'has receipts tray');

    const text = this.$().text();
    assert.notOk(text.includes('away'), 'no away message');
    assert.ok(text.includes(rText.get('contents')), 'renders contexts');
  });
});

test('text with media and away message', function(assert) {
  run(() => {
    const done = assert.async(),
      rText = store.createRecord('record-text', {
        hasAwayMessage: true,
        media: store.createRecord('media'),
      });
    rText.get('media.content').addImage('image/png', VALID_IMAGE_DATA_URL, 77, 88);
    rText.get('media.content').addAudio('audio/mpeg', VALID_MP3_URL_1);
    this.setProperties({ rText });

    this.render(hbs`{{record-item/text text=rText}}`);

    wait().then(() => {
      assert.ok(this.$('.record-item').length);
      assert.ok(this.$('.record-item--text').length);

      assert.ok(this.$('.record-item__metadata').length, 'has metadata');
      assert.ok(this.$('.image-stack').length, 'has images');
      assert.ok(this.$('.record-item__media--audio').length, 'has audio');
      assert.ok(this.$('.record-item__receipts').length, 'has receipts tray');

      const text = this.$().text();
      assert.ok(text.includes('away'), 'has away message');
      done();
    });
  });
});
