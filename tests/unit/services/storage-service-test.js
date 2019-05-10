import * as StorageService from 'textup-frontend/services/storage-service';
import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:storage-service', 'Unit | Service | storage service');

test('checking if an item is persistent (in localStorage)', function(assert) {
  const service = this.subject(),
    getItem = sinon.stub(window.localStorage, 'getItem'),
    key = Math.random(),
    val = Math.random();

  getItem.returns(null);
  assert.equal(service.isItemPersistent(key), false);
  assert.ok(getItem.calledOnce);
  assert.ok(getItem.firstCall.calledWith(key));

  getItem.returns(val);
  assert.equal(service.isItemPersistent(key), true);
  assert.ok(getItem.calledTwice);
  assert.ok(getItem.secondCall.calledWith(key));

  getItem.restore();
});

test('getting an item', function(assert) {
  const service = this.subject(),
    getItemFromLocal = sinon.stub(window.localStorage, 'getItem'),
    getItemFromSession = sinon.stub(window.sessionStorage, 'getItem'),
    key = Math.random() + '',
    val = Math.random();

  assert.equal(service.getItem(['not a string']), undefined);
  assert.ok(getItemFromSession.notCalled, 'passing in a non-string key returns nothing');
  assert.ok(getItemFromLocal.notCalled);

  getItemFromSession.returns(val);
  getItemFromLocal.returns(val);
  assert.equal(service.getItem(key), val);

  assert.ok(getItemFromSession.calledOnce);
  assert.ok(getItemFromSession.firstCall.calledWith(key));
  assert.ok(getItemFromLocal.notCalled);

  getItemFromSession.returns(null);
  getItemFromLocal.returns(val);
  assert.equal(service.getItem(key), val);

  assert.ok(getItemFromSession.calledTwice);
  assert.ok(getItemFromSession.secondCall.calledWith(key));
  assert.ok(
    getItemFromLocal.calledOnce,
    'falls back to local storage if the item is not present in session storage'
  );
  assert.ok(getItemFromLocal.firstCall.calledWith(key));

  getItemFromLocal.restore();
  getItemFromSession.restore();
});

test('setting an item', function(assert) {
  const service = this.subject(),
    setItemFromLocal = sinon.stub(window.localStorage, 'setItem'),
    setItemFromSession = sinon.stub(window.sessionStorage, 'setItem'),
    debug = sinon.stub(Ember, 'debug'),
    key1 = Math.random(),
    val1 = Math.random(),
    key2 = Math.random(),
    val2 = Math.random();

  service.set('persistBetweenSessions', false);

  service.setItem(key1, val1);
  assert.ok(setItemFromSession.calledOnce);
  assert.ok(setItemFromSession.calledWith(key1, val1));
  assert.ok(setItemFromLocal.notCalled);

  service.set('persistBetweenSessions', true);

  service.setItem(key2, val2);
  assert.ok(setItemFromSession.calledTwice);
  assert.ok(setItemFromSession.calledWith(key2, val2));
  assert.ok(setItemFromLocal.calledOnce);
  assert.ok(setItemFromLocal.calledWith(key2, val2));

  setItemFromSession.throws();
  service.setItem(key2, val2); // exception gracefully caught

  assert.ok(debug.calledOnce, 'print the error using debug command if debugging');

  setItemFromLocal.restore();
  setItemFromSession.restore();
  debug.restore();
});

test('sending storage to other tabs', function(assert) {
  const service = this.subject(),
    sessionStorageObj = { [Math.random()]: Math.random() },
    sessionStorage = sinon.stub(window, 'sessionStorage').get(() => sessionStorageObj),
    removeItem = sinon.stub(window.localStorage, 'removeItem'),
    setItem = sinon.stub(window.localStorage, 'setItem');

  service.sendStorageToOtherTabs();

  assert.ok(
    setItem.calledWith(
      StorageService.KEY_RECEIVE_REQUESTED_STORAGE_FROM_OTHER_TAB,
      JSON.stringify(sessionStorageObj)
    )
  );
  assert.ok(removeItem.calledWith(StorageService.KEY_RECEIVE_REQUESTED_STORAGE_FROM_OTHER_TAB));

  sessionStorage.restore();
  removeItem.restore();
  setItem.restore();
});

test('receiving data from another tab', function(assert) {
  const service = this.subject(),
    debug = sinon.stub(Ember, 'debug'),
    clear = sinon.stub(window.sessionStorage, 'clear'),
    setItem = sinon.stub(window.sessionStorage, 'setItem'),
    key1 = Math.random() + '', // keys are stringified
    val1 = Math.random(),
    key2 = Math.random() + '', // keys are stringified
    val2 = Math.random(),
    onStorageUpdate = sinon.spy();

  service.on(config.events.storage.updated, onStorageUpdate);

  service._receiveStorageFromOtherTab(undefined);
  assert.ok(debug.calledOnce, 'fails during parsing');
  assert.ok(clear.notCalled);
  assert.ok(setItem.notCalled);
  assert.ok(onStorageUpdate.notCalled);

  service._receiveStorageFromOtherTab(JSON.stringify([]));
  assert.ok(debug.calledOnce, 'DOES successfully parse');
  assert.ok(clear.notCalled, 'not an object');
  assert.ok(setItem.notCalled);
  assert.ok(onStorageUpdate.notCalled);

  service._receiveStorageFromOtherTab(JSON.stringify({ [key1]: val1, [key2]: val2 }));
  assert.ok(debug.calledOnce, 'DOES successfully parse');
  assert.ok(clear.calledOnce, 'IS an object');
  assert.ok(setItem.calledWith(key1, val1));
  assert.ok(setItem.calledWith(key2, val2));
  assert.ok(onStorageUpdate.calledOnce, 'storage update event triggered');

  debug.restore();
  clear.restore();
  setItem.restore();
});

test('handling the storage event', function(assert) {
  const service = this.subject(),
    sendStorageToOtherTabs = sinon.stub(service, 'sendStorageToOtherTabs'),
    _receiveStorageFromOtherTab = sinon.stub(service, '_receiveStorageFromOtherTab'),
    newValue = Math.random();

  service.startWatchingStorageUpdates();

  Ember.$(window).trigger(Ember.$.Event('storage', { originalEvent: { key: 'matches-nothing' } }));
  assert.ok(sendStorageToOtherTabs.notCalled);
  assert.ok(_receiveStorageFromOtherTab.notCalled);

  Ember.$(window).trigger(
    Ember.$.Event('storage', {
      originalEvent: { key: StorageService.KEY_REQUEST_SEND_STORAGE_FOR_THIS_TAB },
    })
  );
  assert.ok(sendStorageToOtherTabs.calledOnce);
  assert.ok(_receiveStorageFromOtherTab.notCalled);

  Ember.$(window).trigger(
    Ember.$.Event('storage', {
      originalEvent: {
        key: StorageService.KEY_RECEIVE_REQUESTED_STORAGE_FROM_OTHER_TAB,
        storageArea: window.localStorage,
        newValue,
      },
    })
  );
  assert.ok(sendStorageToOtherTabs.calledOnce);
  assert.ok(_receiveStorageFromOtherTab.calledOnce);
  assert.ok(_receiveStorageFromOtherTab.calledWith(newValue));

  sendStorageToOtherTabs.restore();
  _receiveStorageFromOtherTab.restore();
});

test('syncing data with other tabs / requesting data from other tabs', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    setItem = sinon.stub(window.localStorage, 'setItem');

  service.sync().then(() => {
    assert.ok(setItem.calledWith(StorageService.KEY_REQUEST_SEND_STORAGE_FOR_THIS_TAB));

    setItem.restore();
    done();
  });
});
