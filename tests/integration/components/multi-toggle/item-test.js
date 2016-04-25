import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('multi-toggle/item', 'Integration | Component | multi toggle/item', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{multi-toggle/item}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#multi-toggle/item}}
      template block text
    {{/multi-toggle/item}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
