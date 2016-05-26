import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('phone-control/mutable-validated', 'Integration | Component | phone control/mutable validated', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{phone-control/mutable-validated}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#phone-control/mutable-validated}}
      template block text
    {{/phone-control/mutable-validated}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
