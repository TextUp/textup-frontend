import * as WebAppCacheService from 'textup-frontend/services/web-app-cache-service';
// import config from 'textup-frontend/config/environment'; // TODO
import PlatformUtils from 'textup-frontend/utils/platform';
import Service from '@ember/service';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';
// import { run } from '@ember/runloop'; // TODO

moduleFor('service:web-app-cache-service', 'Unit | Service | web app cache service', {
  beforeEach() {
    this.register('service:authService', Service);
    this.inject.service('authService');
    this.register('service:lockService', Service);
    this.inject.service('lockService');
  },
});

// // TODO
// test('trying to trigger an app update', function(assert) {
//   const debug = sinon.stub(EmberDebug, 'debug'),
//     status = sinon.stub(window.applicationCache, 'status'),
//     update = sinon.stub(window.applicationCache, 'update');

//   status.get(() => window.applicationCache.UNCACHED);
//   WebAppCacheService.tryTriggerAppUpdate();
//   assert.ok(update.notCalled, 'do not try to update when appCache tells us no cache');
//   assert.ok(debug.notCalled);

//   status.get(() => 'status-other-than-uncached');
//   WebAppCacheService.tryTriggerAppUpdate();
//   assert.ok(update.calledOnce);
//   assert.ok(debug.notCalled);

//   status.get(() => 'status-other-than-uncached');
//   update.throws();
//   WebAppCacheService.tryTriggerAppUpdate();
//   assert.ok(update.calledTwice);
//   assert.ok(debug.calledOnce, 'thrown errors gracefully caught and logged');

//   debug.restore();
//   status.restore();
//   update.restore();
// });

test('notifying user of update, swapping app cache, then reloading window', function(assert) {
  const status = sinon.stub(window.applicationCache, 'status'),
    swapCache = sinon.stub(window.applicationCache, 'swapCache'),
    confirm = sinon.stub(window, 'confirm'),
    tryReloadWindow = sinon.stub(PlatformUtils, 'tryReloadWindow');

  status.get(() => 'not update ready');
  WebAppCacheService.swapCacheAndReload();
  assert.ok(confirm.notCalled);
  assert.ok(swapCache.notCalled);
  assert.ok(tryReloadWindow.notCalled);

  status.get(() => window.applicationCache.UPDATEREADY);
  confirm.returns(false);
  WebAppCacheService.swapCacheAndReload();
  assert.ok(confirm.calledOnce);
  assert.ok(swapCache.notCalled, 'user has to agree to reload the page before we do so');
  assert.ok(tryReloadWindow.notCalled);

  status.get(() => window.applicationCache.UPDATEREADY);
  confirm.returns(true);
  WebAppCacheService.swapCacheAndReload();
  assert.ok(confirm.calledTwice);
  assert.ok(swapCache.calledOnce);
  assert.ok(tryReloadWindow.calledOnce);

  status.restore();
  swapCache.restore();
  confirm.restore();
  tryReloadWindow.restore();
});

// // TODO how to mock global?
// test('not app cache capable', function(assert) {
//   const service = this.subject(),
//     isAppCacheCapable = sinon.stub(PlatformUtils, 'isAppCacheCapable'),
//     jQueryObj = { on: sinon.stub().returnsThis(), off: sinon.stub().returnsThis() },
//     jQuery = sinon.stub(Ember, '$').returns(jQueryObj),
//     addEventListener = sinon.stub(window.applicationCache, 'addEventListener'),
//     removeEventListener = sinon.stub(window.applicationCache, 'removeEventListener');

//   this.authService.setProperties({
//     on: sinon.stub().returnsThis(),
//     off: sinon.stub().returnsThis(),
//   });
//   this.lockService.setProperties({
//     on: sinon.stub().returnsThis(),
//     off: sinon.stub().returnsThis(),
//   });

//   isAppCacheCapable.returns(false);
//   service.trySetUpAndWatchUpdateEvents();

//   assert.ok(addEventListener.notCalled);
//   assert.ok(jQueryObj.on.notCalled);
//   assert.ok(this.authService.on.notCalled);
//   assert.ok(this.lockService.on.notCalled);

//   run(() => service.destroy());

//   assert.ok(removeEventListener.notCalled);
//   assert.ok(jQueryObj.off.notCalled);
//   assert.ok(this.authService.off.notCalled);
//   assert.ok(this.lockService.off.notCalled);

//   isAppCacheCapable.restore();
//   jQuery.restore();
//   addEventListener.restore();
//   removeEventListener.restore();
// });

// test('IS app cache capable', function(assert) {
//   const service = this.subject(),
//     isAppCacheCapable = sinon.stub(PlatformUtils, 'isAppCacheCapable'),
//     jQueryObj = { on: sinon.stub().returnsThis(), off: sinon.stub().returnsThis() },
//     jQuery = sinon.stub(Ember, '$').returns(jQueryObj),
//     addEventListener = sinon.stub(window.applicationCache, 'addEventListener'),
//     removeEventListener = sinon.stub(window.applicationCache, 'removeEventListener');

//   this.authService.setProperties({
//     on: sinon.stub().returnsThis(),
//     off: sinon.stub().returnsThis(),
//   });
//   this.lockService.setProperties({
//     on: sinon.stub().returnsThis(),
//     off: sinon.stub().returnsThis(),
//   });

//   isAppCacheCapable.returns(true);
//   service.trySetUpAndWatchUpdateEvents();

//   assert.ok(
//     addEventListener.calledWith('updateready', WebAppCacheService.swapCacheAndReload, false)
//   );
//   assert.ok(jQueryObj.on.calledWith('load', WebAppCacheService.tryTriggerAppUpdate));
//   assert.ok(
//     this.authService.on.calledWith(
//       config.events.auth.success,
//       service,
//       WebAppCacheService.tryTriggerAppUpdate
//     )
//   );
//   assert.ok(
//     this.authService.on.calledWith(
//       config.events.auth.clear,
//       service,
//       WebAppCacheService.tryTriggerAppUpdate
//     )
//   );
//   assert.ok(
//     this.lockService.on.calledWith(
//       config.events.lock.unlocked,
//       service,
//       WebAppCacheService.tryTriggerAppUpdate
//     )
//   );

//   run(() => service.destroy());

//   assert.ok(removeEventListener.calledWith('updateready', WebAppCacheService.swapCacheAndReload));
//   assert.ok(jQueryObj.off.calledWith('load', WebAppCacheService.tryTriggerAppUpdate));
//   assert.ok(this.authService.off.calledWith(config.events.auth.success, service));
//   assert.ok(this.authService.off.calledWith(config.events.auth.clear, service));
//   assert.ok(this.lockService.off.calledWith(config.events.lock.unlocked, service));

//   isAppCacheCapable.restore();
//   jQuery.restore();
//   addEventListener.restore();
//   removeEventListener.restore();
// });
