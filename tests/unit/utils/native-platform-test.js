import NativePlatform from 'textup-frontend/utils/native-platform';
import { module, test } from 'qunit';
import config from 'textup-frontend/config/environment';

module('Unit | Utility | native platform');

test('platform android', function(assert) {
  assert.notOk(NativePlatform.isAndroid());
  config.hasCordova = true;
  window.device = { platform: NativePlatform.PLATFORM_ANDROID };
  assert.ok(NativePlatform.isAndroid());
});

test('platform ios', function(assert) {
  assert.notOk(NativePlatform.isIOS());
  config.hasCordova = true;
  window.device = { platform: NativePlatform.PLATFORM_IOS };
  assert.ok(NativePlatform.isIOS());
});
