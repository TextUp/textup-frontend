import { getOwner } from '@ember/application';
import LocationUtils from 'textup-frontend/utils/location';
import { moduleFor, test } from 'ember-qunit';

moduleFor('util:location', 'Unit | Utility | location', {
  needs: ['config:environment'],
});

test('building preview url', function(assert) {
  const config = getOwner(this).resolveRegistration('config:environment'),
    url = config.locationPreview.host,
    token = config.apiKeys.mapbox,
    lat = Math.random(),
    lng = Math.random(),
    size = Math.random();

  const noInputsRes = LocationUtils.buildPreviewUrl();
  assert.ok(noInputsRes.includes(url));
  assert.ok(noInputsRes.includes(`access_token=${token}`));
  assert.ok(noInputsRes.includes('pin-m'));
  assert.ok(noInputsRes.includes('15'));
  assert.ok(noInputsRes.includes('.png'));

  const allInputsRes = LocationUtils.buildPreviewUrl(lat, lng, size);
  assert.ok(allInputsRes.includes(`${lng},${lat}`));
  assert.ok(allInputsRes.includes(`${size}x${size}`));
  assert.ok(allInputsRes.includes(url));
  assert.ok(allInputsRes.includes(`access_token=${token}`));
  assert.ok(allInputsRes.includes('pin-m'));
  assert.ok(allInputsRes.includes('15'));
  assert.ok(allInputsRes.includes('.png'));
});
