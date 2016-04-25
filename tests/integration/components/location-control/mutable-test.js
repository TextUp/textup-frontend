import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('location-control/mutable', 'Integration | Component | location control/mutable', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{location-control/mutable}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#location-control/mutable}}
      template block text
    {{/location-control/mutable}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
