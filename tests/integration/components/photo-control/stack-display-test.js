import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('photo-control/stack-display', 'Integration | Component | photo control/stack display', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{photo-control/stack-display}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#photo-control/stack-display}}
      template block text
    {{/photo-control/stack-display}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
