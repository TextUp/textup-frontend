import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('record-cluster/item/text', 'Integration | Component | record cluster/item/text', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{record-cluster/item/text}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#record-cluster/item/text}}
      template block text
    {{/record-cluster/item/text}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
