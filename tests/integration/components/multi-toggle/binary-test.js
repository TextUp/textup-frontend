import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('multi-toggle/binary', 'Integration | Component | multi toggle/binary', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{multi-toggle/binary}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#multi-toggle/binary}}
      template block text
    {{/multi-toggle/binary}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
