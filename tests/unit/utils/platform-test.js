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
