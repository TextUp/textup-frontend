import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('record-item/system-note', 'Integration | Component | record item/system note', {
  integration: true,
});

test('inputs', function(assert) {
  run(() => {
    const store = getOwner(this).lookup('service:store'),
      item = store.createRecord('record-item'),
      note = store.createRecord('record-note');

    this.setProperties({ item, note });

    this.render(hbs`{{record-item/system-note note=note}}`);

    assert.ok(this.$('.record-item').length);
    assert.ok(this.$('.record-item--system-message').length);
    assert.ok(this.$('.record-item__metadata').length);
  });
});
