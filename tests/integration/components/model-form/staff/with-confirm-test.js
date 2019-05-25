import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('model-form/staff/with-confirm', 'Integration | Component | model form/staff/with confirm', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{model-form/staff/with-confirm}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#model-form/staff/with-confirm}}
      template block text
    {{/model-form/staff/with-confirm}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
