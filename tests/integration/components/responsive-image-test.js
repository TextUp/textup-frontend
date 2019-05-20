import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import Constants from 'textup-frontend/constants';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import {
  mockValidMediaImage,
  VALID_IMAGE_DATA_URL
} from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('responsive-image', 'Integration | Component | responsive image', {
  integration: true,
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

  const store = getOwner(this).lookup('service:store'),
    versions = mockValidMediaImage(store).get('versions.content');

  this.set('versions', versions);
  this.render(hbs`{{responsive-image versions=versions}}`);

  assert.ok(
    this.$('img.responsive-image').length,
    'renders successfully when passed in MediaImageVersions'
  );
});

test('rendering success + rerendering on attribute change', function(assert) {
  const done = assert.async(),
    onSuccess = sinon.spy(),
    onFailure = sinon.spy();

  this.setProperties({
    versions: [{ source: VALID_IMAGE_DATA_URL }],
    onSuccess,
    onFailure,
  });

  this.render(hbs`{{responsive-image versions=versions onSuccess=onSuccess onFailure=onFailure}}`);

  assert.ok(this.$('img.responsive-image').length, 'did render');

  // wait helper doesn't wait long enough for the image to load
  run.later(() => {
    assert.ok(onSuccess.calledOnce, 'success handler called');
    assert.ok(onFailure.notCalled, 'failure handler NOT called');

    assert.ok(this.$('img.responsive-image--success').length);

    this.set('versions', []);

    assert.notOk(
      this.$('img.responsive-image--success').length,
      'success state is removed as soon as attrs change because this image is reloading'
    );

    done();
  }, 500);
});

test('rendering failure', function(assert) {
  const done = assert.async(),
    onSuccess = sinon.spy(),
    onFailure = sinon.spy();

  this.setProperties({ versions: [{ source: 'invalid source' }], onSuccess, onFailure });

  this.render(hbs`{{responsive-image versions=versions onSuccess=onSuccess onFailure=onFailure}}`);

  assert.ok(this.$('img.responsive-image').length, 'did render');

  // wait helper doesn't wait long enough for the image to load
  run.later(() => {
    assert.ok(onSuccess.notCalled, 'success handler NOT called');
    assert.ok(onFailure.calledOnce, 'failure handler called');

    assert.notOk(this.$('img.responsive-image--success').length);

    done();
  }, 500);
});

test('rendering nonresponsive image', function(assert) {
  const source = 'https://via.placeholder.com/350x150';
  this.set('versions', [{ source }]);

  this.render(hbs`{{responsive-image versions=versions}}`);

  const $img = this.$('img');
  assert.ok($img.length, 'renders successfully');

  assert.equal($img.attr('srcset'), '', 'no srcset');
  assert.ok($img.attr('sizes').includes('vw'), 'sizes is present');
  assert.equal($img.attr('src'), source, 'fallback src is present');
  assert.notOk($img.attr('width'), 'no width');
  assert.equal($img.attr('alt'), Constants.IMAGE.DEFAULT_ALT, 'alt is present');

  const sizeAttr = parseInt(/(\d+)/.exec($img.attr('sizes')));
  assert.ok(sizeAttr <= 100, 'size <= 100');
  assert.ok(sizeAttr >= 1, 'size >= 1');
});

test('rendering responsive image', function(assert) {
  const versionsWithWidth = [
      { source: 'https://via.placeholder.com/350x150', width: 350 },
      { source: 'https://via.placeholder.com/100x150', width: 100 },
      { source: 'https://via.placeholder.com/50x150', width: 50 },
      { source: VALID_IMAGE_DATA_URL, width: 10 },
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
  assert.equal($img.attr('src'), versionsNoWidth[0].source, 'fallback src is present');
  assert.equal($img.attr('width'), '350', 'no width');
  assert.equal($img.attr('alt'), Constants.IMAGE.DEFAULT_ALT, 'alt is present');

  const sizeAttr = parseInt(/(\d+)/.exec($img.attr('sizes')));
  assert.ok(sizeAttr <= 100, 'size <= 100');
  assert.ok(sizeAttr >= 1, 'size >= 1');
});
