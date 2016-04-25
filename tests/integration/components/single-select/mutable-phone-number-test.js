import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('single-select/mutable-phone-number', 'Integration | Component | single select/mutable phone number', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{single-select/mutable-phone-number}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#single-select/mutable-phone-number}}
      template block text
    {{/single-select/mutable-phone-number}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
