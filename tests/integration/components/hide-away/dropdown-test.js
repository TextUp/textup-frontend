import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('hide-away/dropdown', 'Integration | Component | hide away/dropdown', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{hide-away/dropdown}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#hide-away/dropdown}}
      template block text
    {{/hide-away/dropdown}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
