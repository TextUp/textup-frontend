import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('sliding-drawer', 'Integration | Component | sliding drawer', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{sliding-drawer}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#sliding-drawer}}
      template block text
    {{/sliding-drawer}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
