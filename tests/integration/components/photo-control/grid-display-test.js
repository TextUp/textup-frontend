import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('photo-control/grid-display', 'Integration | Component | photo control/grid display', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{photo-control/grid-display}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#photo-control/grid-display}}
      template block text
    {{/photo-control/grid-display}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
