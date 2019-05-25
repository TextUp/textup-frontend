import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('status-list/contact', 'Integration | Component | status list/contact', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{status-list/contact}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#status-list/contact}}
      template block text
    {{/status-list/contact}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
