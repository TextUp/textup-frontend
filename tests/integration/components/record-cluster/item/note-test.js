import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('record-cluster/item/note', 'Integration | Component | record cluster/item/note', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{record-cluster/item/note}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#record-cluster/item/note}}
      template block text
    {{/record-cluster/item/note}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
