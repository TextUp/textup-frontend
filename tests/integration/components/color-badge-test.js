import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('color-badge', 'Integration | Component | color badge', {
  integration: true,
});

test('properties', function(assert) {
  this.render(hbs`{{color-badge text="hi" color="red"}}`);

  assert.ok(this.$('.badge.badge--outline').length);
});

test('rendering', function(assert) {
  const text = `${Math.random()}`,
    color = 'purple';
  this.setProperties({ text, color });

  this.render(hbs`{{color-badge text=text color=color}}`);

  assert.ok(this.$('.badge.badge--outline').length);
  assert.ok(
    this.$()
      .text()
      .trim()
      .indexOf(text) > -1
  );
  assert.equal(this.$('.badge').attr('style'), `border-color: ${color};`);
});
