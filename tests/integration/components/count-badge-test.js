import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('count-badge', 'Integration | Component | count badge', {
  integration: true
});

test('properties', function(assert) {
  this.render(hbs`{{count-badge}}`);

  assert.ok(this.$('.count-badge').length);

  this.render(hbs`{{count-badge count=88 hideBadgeIfNone=false}}`);

  assert.ok(this.$('.count-badge').length);

  assert.throws(() => this.render(hbs`{{count-badge count="hi" hideBadgeIfNone="hi"}}`));
});

test('rendering', function(assert) {
  const badgeText = Math.random();

  this.setProperties({ badgeText });
  this.render(hbs`{{#count-badge}}{{badgeText}}{{/count-badge}}`);

  assert.ok(this.$('.count-badge').length);
  assert.ok(this.$('.count-badge__count').length);
  assert.ok(this.$('.count-badge--no-badge').length);
  assert.ok(
    this.$()
      .text()
      .indexOf(badgeText) > -1
  );
  assert.equal(
    this.$('.count-badge__count')
      .text()
      .trim(),
    '0'
  );

  this.render(hbs`{{#count-badge hideBadgeIfNone=false}}{{badgeText}}{{/count-badge}}`);

  assert.ok(this.$('.count-badge').length);
  assert.ok(this.$('.count-badge__count').length);
  assert.notOk(this.$('.count-badge--no-badge').length);
  assert.ok(
    this.$()
      .text()
      .indexOf(badgeText) > -1
  );
  assert.equal(
    this.$('.count-badge__count')
      .text()
      .trim(),
    '0'
  );

  this.render(hbs`{{#count-badge count=88}}{{badgeText}}{{/count-badge}}`);

  assert.notOk(this.$('.count-badge--no-badge').length);
  assert.ok(
    this.$()
      .text()
      .indexOf(badgeText) > -1
  );
  assert.equal(
    this.$('.count-badge__count')
      .text()
      .trim(),
    '88'
  );

  this.render(hbs`{{#count-badge count=888}}{{badgeText}}{{/count-badge}}`);

  assert.notOk(this.$('.count-badge--no-badge').length);
  assert.ok(
    this.$()
      .text()
      .indexOf(badgeText) > -1
  );
  assert.equal(
    this.$('.count-badge__count')
      .text()
      .trim(),
    '99+'
  );
});
