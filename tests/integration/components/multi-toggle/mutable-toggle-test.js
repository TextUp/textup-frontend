import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('multi-toggle/mutable-toggle', 'Integration | Component | multi toggle/mutable toggle', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{multi-toggle/mutable-toggle}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#multi-toggle/mutable-toggle}}
      template block text
    {{/multi-toggle/mutable-toggle}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
