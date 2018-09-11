import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const { run } = Ember;

moduleForComponent('record-item/system-note', 'Integration | Component | record item/system note', {
  integration: true
});

test('inputs', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      item = store.createRecord('record-item'),
      note = store.createRecord('record-note');

    this.setProperties({ item, note });

    assert.throws(() => this.render(hbs`{{record-item/system-note}}`), 'requires note');
    assert.throws(() => this.render(hbs`{{record-item/system-note note=item}}`), 'requires note');

    this.render(hbs`{{record-item/system-note note=note}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--system-message').length);
    assert.ok(this.$('.record-item__metadata').length);
  });
});
