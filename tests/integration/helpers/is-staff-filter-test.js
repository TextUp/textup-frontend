import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('is-staff-filter', 'helper:is-staff-filter', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) {
  this.set('inputValue', '1234');

  this.render(hbs`{{is-staff-filter inputValue}}`);

  assert.equal(this.$().text().trim(), '1234');
});
