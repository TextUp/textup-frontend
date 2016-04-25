import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('multi-toggle/group-by-bucket', 'Integration | Component | multi toggle/group by bucket', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{multi-toggle/group-by-bucket}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#multi-toggle/group-by-bucket}}
      template block text
    {{/multi-toggle/group-by-bucket}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
