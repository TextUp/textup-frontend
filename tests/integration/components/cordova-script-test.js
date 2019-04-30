import config from 'textup-frontend/config/environment';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('cordova-script', 'Integration | Component | cordova script', {
  integration: true,
});

test('rendering', function(assert) {
  const hasCordova = sinon.stub(config, 'hasCordova');

  hasCordova.get(() => false);
  this.render(hbs`{{cordova-script}}`);

  assert.ok(this.$('script[type="text/javascript"]').length, 'did render');
  assert.notOk(
    this.$('script[type="text/javascript"]').attr('src'),
    'not source because no cordova'
  );

  hasCordova.get(() => true);
  this.render(hbs`{{cordova-script}}`);

  assert.ok(this.$('script[type="text/javascript"]').length, 'did render');
  assert.equal(
    this.$('script[type="text/javascript"]').attr('src'),
    'cordova.js',
    'source is cordova script'
  );

  hasCordova.restore();
});
