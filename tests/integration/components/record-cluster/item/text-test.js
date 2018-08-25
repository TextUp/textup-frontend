import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';

const { run } = Ember;
let store;

moduleForComponent(
  'record-cluster/item/text',
  'Integration | Component | record cluster/item/text',
  {
    integration: true,
    beforeEach() {
      store = Ember.getOwner(this).lookup('service:store');
    }
  }
);

test('inputs', function(assert) {
  run(() => {
    const rItem = store.createRecord('record-item'),
      rText = store.createRecord('record-text');
    this.setProperties({ rItem, rText });

    assert.throws(() => this.render(hbs`{{record-cluster/item/text}}`), 'requires text');
    assert.throws(() => this.render(hbs`{{record-cluster/item/text text=rItem}}`), 'requires text');

    this.render(hbs`{{record-cluster/item/text text=rText}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--text').length);
    assert.ok(this.$('.record-item__metadata').length);
  });
});

test('text with only contents', function(assert) {
  run(() => {
    const rText = store.createRecord('record-text', {
      contents: `${Math.random()}`
    });
    this.setProperties({ rText });

    this.render(hbs`{{record-cluster/item/text text=rText}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--text').length);

    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.notOk(this.$('.image-stack').length, 'no images');
    assert.ok(this.$('.record-item__receipts').length, 'has receipts tray');

    const text = this.$().text();
    assert.notOk(text.includes('away'), 'no away message');
    assert.ok(text.includes(rText.get('contents')), 'renders contexts');
  });
});

test('text with media and away message', function(assert) {
  run(() => {
    const rText = store.createRecord('record-text', {
      hasAwayMessage: true
    });
    this.setProperties({ rText });

    this.render(hbs`{{record-cluster/item/text text=rText}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--text').length);

    assert.ok(this.$('.record-item__metadata').length, 'has metadata');
    assert.notOk(this.$('.image-stack').length, 'no images');
    assert.ok(this.$('.record-item__receipts').length, 'has receipts tray');

    const text = this.$().text();
    assert.ok(text.includes('away'), 'has away message');
  });
});
