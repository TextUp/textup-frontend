import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('contacts-load', 'Integration | Component | contacts load', {
  integration: true,
});

test('it renders', function(assert) {
  this.render(hbs`{{contacts-load}}`);
  assert.ok(this.$('.contacts-load').length);
});
