import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('lock-pad/indicator', 'Integration | Component | lock pad/indicator', {
  integration: true,
});

test('it renders', function(assert) {
  this.render(hbs`{{lock-pad/indicator}}`);
  assert.ok(this.$('.lock-pad__indicator').length);
});

test('renders filled', function(assert) {
  const indicatorNum = 1;
  const numFilled = 1;

  this.setProperties({ indicatorNum });
  this.setProperties({ numFilled });

  this.render(hbs`{{lock-pad/indicator indicatorNum=indicatorNum numFilled=numFilled}}`);

  assert.ok(this.$('.lock-pad__indicator--filled').length);
});

test('renders empty', function(assert) {
  const indicatorNum = 1;
  const numFilled = 0;

  this.setProperties({ indicatorNum });
  this.setProperties({ numFilled });

  this.render(hbs`{{lock-pad/indicator indicatorNum=indicatorNum numFilled=numFilled}}`);

  assert.ok(this.$('.lock-pad__indicator--filled').length === 0);
});
