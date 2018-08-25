import Ember from 'ember';
import LocationUtils from 'textup-frontend/utils/location';
import { moduleFor, test } from 'ember-qunit';

moduleFor('util:location', 'Unit | Utility | location', {
  needs: ['config:environment']
});

test('building preview url', function(assert) {
  const config = Ember.getOwner(this).resolveRegistration('config:environment'),
    url = config.locationPreview.host,
    token = config.apiKeys.mapbox,
    lat = Math.random(),
    lng = Math.random(),
    size = Math.random();

  assert.notOk(LocationUtils.buildPreviewUrl(), 'must pass in config');
  assert.ok(LocationUtils.buildPreviewUrl({}), 'config can be empty object');

  const onlyConfigRes = LocationUtils.buildPreviewUrl(config);
  assert.ok(onlyConfigRes.includes(url));
  assert.ok(onlyConfigRes.includes(`access_token=${token}`));
  assert.ok(onlyConfigRes.includes('pin-m'));
  assert.ok(onlyConfigRes.includes('15'));
  assert.ok(onlyConfigRes.includes('.png'));

  const allInputsRes = LocationUtils.buildPreviewUrl(config, lat, lng, size);
  assert.ok(allInputsRes.includes(`${lng},${lat}`));
  assert.ok(allInputsRes.includes(`${size}x${size}`));
  assert.ok(allInputsRes.includes(url));
  assert.ok(allInputsRes.includes(`access_token=${token}`));
  assert.ok(allInputsRes.includes('pin-m'));
  assert.ok(allInputsRes.includes('15'));
  assert.ok(allInputsRes.includes('.png'));
});
