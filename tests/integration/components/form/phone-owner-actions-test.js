import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('form/phone-owner-actions', 'Integration | Component | form/phone owner actions', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{form/phone-owner-actions}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#form/phone-owner-actions}}
      template block text
    {{/form/phone-owner-actions}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
