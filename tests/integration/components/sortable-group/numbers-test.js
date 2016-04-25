import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('sortable-group/numbers', 'Integration | Component | sortable group/numbers', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{sortable-group/numbers}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#sortable-group/numbers}}
      template block text
    {{/sortable-group/numbers}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
