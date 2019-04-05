import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tour-manager', 'Integration | Component | tour manager', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{tour-manager}}`);

  assert.equal(
    this.$()
      .text()
      .trim(),
    ''
  );
});
