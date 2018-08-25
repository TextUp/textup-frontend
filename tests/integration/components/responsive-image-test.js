import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { mockValidMediaImage, VALID_IMAGE_DATA_URL } from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

// [FUTURE] investigate testing window resizing recalculation

const DEFAULT_ALT = 'I am the default alt message',
  mockConstants = Ember.Service.extend({ IMAGE: { DEFAULT_ALT } });

moduleForComponent('responsive-image', 'Integration | Component | responsive image', {
  integration: true,
  beforeEach() {
    this.register('service:constants', mockConstants);
    this.inject.service('constants');
  }
});

test('inputs', function(assert) {
  this.render(hbs`{{responsive-image}}`);

  assert.ok(
    this.$('img.responsive-image').length,
    'just displays a placeholder when versions are not provided'
  );

  const alt = `${Math.random()}`;
  this.setProperties({ versions: [{ source: 'https://via.placeholder.com/350x150' }], alt });

  this.render(hbs`{{responsive-image versions=versions alt=alt}}`);

  assert.ok(this.$('img.responsive-image').length, 'renders successfully');
  assert.equal(this.$('img.responsive-image').attr('alt'), alt, 'renders provided alt text');

  const versions = mockValidMediaImage().get('versions');
  this.set('versions', versions);
  this.render(hbs`{{responsive-image versions=versions}}`);

  assert.ok(
    this.$('img.responsive-image').length,
    'renders successfully when passed in MediaImageVersions'
  );

  this.set('versions', [{ test: 'required source prop not provided' }]);
  assert.throws(
    () => this.render(hbs`{{responsive-image versions=versions}}`),
    'when provided, objects in versions list must conform to spec'
  );
});

test('rendering success', function(assert) {
  const done = assert.async(),
    onSuccess = sinon.spy(),
    onFailure = sinon.spy();

  this.setProperties({
    versions: [
      {
        source: VALID_IMAGE_DATA_URL
      }
    ],
    onSuccess,
    onFailure
  });

  this.render(hbs`{{responsive-image versions=versions onSuccess=onSuccess onFailure=onFailure}}`);

  wait().then(() => {
    Ember.run.later(() => {
      // wait helper doesn't wait long enough for the image to load
      assert.ok(onSuccess.calledOnce, 'success handler called');
      assert.ok(onFailure.notCalled, 'failure handler NOT called');
      done();
    }, 500);
  });
});

test('rendering failure', function(assert) {
  const done = assert.async(),
    onSuccess = sinon.spy(),
    onFailure = sinon.spy();

  this.setProperties({ versions: [{ source: 'invalid source' }], onSuccess, onFailure });

  this.render(hbs`{{responsive-image versions=versions onSuccess=onSuccess onFailure=onFailure}}`);

  wait().then(() => {
    Ember.run.later(() => {
      // wait helper doesn't wait long enough for the image to load
      assert.ok(onSuccess.notCalled, 'success handler NOT called');
      assert.ok(onFailure.calledOnce, 'failure handler called');
      done();
    }, 500);
  });
});

test('rendering nonresponsive image', function(assert) {
  const source = 'https://via.placeholder.com/350x150';
  this.set('versions', [{ source }]);

  this.render(hbs`{{responsive-image versions=versions}}`);

  const $img = this.$('img');
  assert.ok($img.length, 'renders successfully');

  assert.equal($img.attr('srcset'), '', 'no srcset');
  assert.ok($img.attr('sizes').includes('vw'), 'sizes is present');
  assert.ok(parseInt(/(\d+)/.exec($img.attr('sizes'))) <= 100, 'size <= 100');
  assert.equal($img.attr('src'), source, 'fallback src is present');
  assert.notOk($img.attr('width'), 'no width');
  assert.equal($img.attr('alt'), DEFAULT_ALT, 'alt is present');
});

test('rendering responsive image', function(assert) {
  const versionsWithWidth = [
      { source: 'https://via.placeholder.com/350x150', width: 350 },
      { source: 'https://via.placeholder.com/100x150', width: 100 },
      { source: 'https://via.placeholder.com/50x150', width: 50 },
      {
        source: VALID_IMAGE_DATA_URL,
        width: 10
      }
    ],
    versionsNoWidth = [{ source: 'https://via.placeholder.com/300x150' }];
  this.set('versions', [].pushObjects(versionsWithWidth).pushObjects(versionsNoWidth));

  this.render(hbs`{{responsive-image versions=versions}}`);

  const $img = this.$('img');
  assert.ok($img.length, 'renders successfully');

  versionsWithWidth.forEach(({ source, width }) => {
    assert.ok($img.attr('srcset').includes(source), 'has source');
    assert.ok($img.attr('srcset').includes(width + 'w'), 'has source width');
  });
  versionsNoWidth.forEach(({ source }) => {
    assert.ok(!$img.attr('srcset').includes(source), 'does not have source without width');
  });
  assert.ok($img.attr('sizes').includes('vw'), 'sizes is present');
  assert.ok(parseInt(/(\d+)/.exec($img.attr('sizes'))) <= 100, 'size <= 100');
  assert.equal($img.attr('src'), versionsNoWidth[0].source, 'fallback src is present');
  assert.equal($img.attr('width'), '350', 'no width');
  assert.equal($img.attr('alt'), DEFAULT_ALT, 'alt is present');
});
