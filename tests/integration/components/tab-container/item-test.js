import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tab-container/item', 'Integration | Component | tab container/item', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{tab-container/item}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#tab-container/item}}
      template block text
    {{/tab-container/item}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
