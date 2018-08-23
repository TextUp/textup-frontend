import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('upcoming-future-messages', 'Integration | Component | upcoming future messages', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{upcoming-future-messages}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#upcoming-future-messages}}
      template block text
    {{/upcoming-future-messages}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
