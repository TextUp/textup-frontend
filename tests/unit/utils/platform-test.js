import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import PlatformUtils from 'textup-frontend/utils/platform';
import sinon from 'sinon';
import { module, test } from 'qunit';

module('Unit | Utility | platform');

test('native platforms', function(assert) {
  const hasCordova = sinon.stub(config, 'hasCordova'),
    oldDevice = window.device;

  hasCordova.get(() => false);
  assert.equal(PlatformUtils.isAndroid(), false);
  assert.equal(PlatformUtils.isIOS(), false);

  hasCordova.get(() => true);
  window.device = { platform: PlatformUtils.PLATFORM_ANDROID };
  assert.equal(PlatformUtils.isAndroid(), true);
  assert.equal(PlatformUtils.isIOS(), false);

  hasCordova.get(() => true);
  window.device = { platform: PlatformUtils.PLATFORM_IOS };
  assert.equal(PlatformUtils.isAndroid(), false);
  assert.equal(PlatformUtils.isIOS(), true);

  hasCordova.restore();
  window.device = oldDevice;
});

test('determining if mobile', function(assert) {
  const jQueryObj = { innerWidth: sinon.stub() },
    jQuery = sinon.stub(Ember, '$').returns(jQueryObj);

  jQueryObj.innerWidth.returns(PlatformUtils.PLATFORM_MOBILE_MAX_WIDTH_IN_PX - 8);
  assert.ok(PlatformUtils.isMobile());
  assert.ok(jQuery.calledOnce);
  assert.ok(jQuery.firstCall.calledWith(window));

  jQueryObj.innerWidth.returns(PlatformUtils.PLATFORM_MOBILE_MAX_WIDTH_IN_PX + 8);
  assert.notOk(PlatformUtils.isMobile());
  assert.ok(jQuery.calledTwice);
  assert.ok(jQuery.secondCall.calledWith(window));

  jQuery.restore();
});

test('determining if has appCache', function(assert) {
  const hasCordova = sinon.stub(config, 'hasCordova'),
    oldManifest = config.manifest,
    applicationCache = sinon.stub(window, 'applicationCache');

  hasCordova.get(() => false);
  config.manifest = { enabled: false };
  applicationCache.get(() => null);
  assert.equal(PlatformUtils.isAppCacheCapable(), false, 'not cordova, but manifest disabled');

  hasCordova.get(() => true);
  config.manifest = { enabled: true };
  applicationCache.get(() => Math.random());
  assert.equal(PlatformUtils.isAppCacheCapable(), false, 'manifest is enabled but is cordova');

  hasCordova.get(() => false);
  config.manifest = { enabled: true };
  applicationCache.get(() => null);
  assert.equal(
    PlatformUtils.isAppCacheCapable(),
    false,
    'not cordova, manifest is enabled but appCache unavailable'
  );

  hasCordova.get(() => false);
  config.manifest = { enabled: true };
  applicationCache.get(() => Math.random());
  assert.equal(
    PlatformUtils.isAppCacheCapable(),
    true,
    'not cordova, manifest is enabled, appCache available'
  );

  hasCordova.restore();
  config.manifest = oldManifest;
  applicationCache.restore();
});
