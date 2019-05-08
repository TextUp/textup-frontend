import * as SocketDataService from 'textup-frontend/services/socket-data-service';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

const { run } = Ember;

moduleFor('service:socket-data-service', 'Unit | Service | socket data service', {
  beforeEach() {
    this.register('service:authService', Ember.Service);
    this.inject.service('authService');
    this.register('service:store', Ember.Service);
    this.inject.service('store');
    this.register('service:websocketService', Ember.Service);
    this.inject.service('websocketService');
  },
});

test('normalizing and pushing socket payload', function(assert) {
  const service = this.subject(),
    modelName = Math.random(),
    data = [Math.random()],
    normalizedObj = Math.random(),
    serializerObj = { normalizeResponse: sinon.stub().returns(normalizedObj) },
    modelClass = Math.random();

  this.store.setProperties({
    serializerFor: sinon.stub().returns(serializerObj),
    modelFor: sinon.stub().returns(modelClass),
    push: sinon.spy(),
  });
  this.authService.setProperties({ off: sinon.stub().returnsThis() });

  service._normalizeAndPushSocketPayload();
  assert.ok(this.store.serializerFor.notCalled);

  service._normalizeAndPushSocketPayload(modelName, 'not an array');
  assert.ok(this.store.serializerFor.notCalled);

  service._normalizeAndPushSocketPayload(modelName, data);
  assert.ok(this.store.serializerFor.calledWith(modelName));
  assert.ok(this.store.modelFor.calledWith(modelName));
  assert.ok(
    serializerObj.normalizeResponse.calledWith(
      this.store,
      modelClass,
      { [modelName]: data },
      null,
      SocketDataService.STORE_REQUEST_TYPE
    )
  );
  assert.ok(this.store.push.calledWith(normalizedObj));
});

test('handling data for various model types', function(assert) {
  const service = this.subject(),
    _normalizeAndPushSocketPayload = sinon.stub(service, '_normalizeAndPushSocketPayload'),
    data = [Math.random()];

  this.authService.setProperties({ off: sinon.stub().returnsThis() });

  service._handlePhones(data);
  assert.ok(_normalizeAndPushSocketPayload.calledWith(Constants.MODEL.PHONE, data));

  service._handleFutureMsgs(data);
  assert.ok(_normalizeAndPushSocketPayload.calledWith(Constants.MODEL.FUTURE_MESSAGE, data));

  service._handleRecordItems(data);
  assert.ok(_normalizeAndPushSocketPayload.calledWith(Constants.MODEL.RECORD_ITEM, data));

  service._handleContacts(data);
  assert.ok(_normalizeAndPushSocketPayload.calledWith(Constants.MODEL.CONTACT, data));

  _normalizeAndPushSocketPayload.restore();
});

test('right handler is bound to the right event', function(assert) {
  const service = this.subject(),
    channelName = Math.random(),
    _handlePhones = sinon.stub(service, '_handlePhones'),
    _handleFutureMsgs = sinon.stub(service, '_handleFutureMsgs'),
    _handleRecordItems = sinon.stub(service, '_handleRecordItems'),
    _handleContacts = sinon.stub(service, '_handleContacts');

  this.authService.setProperties({ off: sinon.stub().returnsThis() });
  this.websocketService.setProperties({
    connect: sinon.spy(),
    bind: sinon.spy(),
  });

  service._bindSocketEvents();
  assert.ok(
    this.websocketService.connect.notCalled,
    'will not bind to socket events if no `channelName` found'
  );
  assert.ok(this.websocketService.bind.notCalled);

  this.authService.setProperties({ authUser: { channelName } });
  service._bindSocketEvents();
  assert.ok(this.websocketService.connect.callCount > 0, 'has been called');
  assert.ok(this.websocketService.bind.callCount > 0);

  this.websocketService.bind.args
    .find(fnArgs => fnArgs[1] === SocketDataService.EVENT_RECORD_ITEMS)[2]
    .call();
  assert.ok(_handlePhones.notCalled);
  assert.ok(_handleFutureMsgs.notCalled);
  assert.ok(_handleRecordItems.calledOnce);
  assert.ok(_handleContacts.notCalled);

  this.websocketService.bind.args
    .find(fnArgs => fnArgs[1] === SocketDataService.EVENT_CONTACTS)[2]
    .call();
  assert.ok(_handlePhones.notCalled);
  assert.ok(_handleFutureMsgs.notCalled);
  assert.ok(_handleRecordItems.calledOnce);
  assert.ok(_handleContacts.calledOnce);

  this.websocketService.bind.args
    .find(fnArgs => fnArgs[1] === SocketDataService.EVENT_FUTURE_MESSAGES)[2]
    .call();
  assert.ok(_handlePhones.notCalled);
  assert.ok(_handleFutureMsgs.calledOnce);
  assert.ok(_handleRecordItems.calledOnce);
  assert.ok(_handleContacts.calledOnce);

  this.websocketService.bind.args
    .find(fnArgs => fnArgs[1] === SocketDataService.EVENT_PHONES)[2]
    .call();
  assert.ok(_handlePhones.calledOnce);
  assert.ok(_handleFutureMsgs.calledOnce);
  assert.ok(_handleRecordItems.calledOnce);
  assert.ok(_handleContacts.calledOnce);

  _handlePhones.restore();
  _handleFutureMsgs.restore();
  _handleRecordItems.restore();
  _handleContacts.restore();
});

test('binding + unbinding events', function(assert) {
  const service = this.subject(),
    authHeader = Math.random(),
    channelName = Math.random();

  this.authService.setProperties({
    authHeader,
    authUser: { channelName },
    on: sinon.stub().returnsThis(),
    off: sinon.stub().returnsThis(),
  });
  this.websocketService.setProperties({
    connect: sinon.spy(),
    bind: sinon.spy(),
    disconnect: sinon.spy(),
  });

  this.authService.on.callsArgOn(2, service);
  service.startWatchingAuthChanges();
  assert.ok(this.authService.on.calledWith(config.events.auth.success, service));
  assert.ok(this.authService.on.calledWith(config.events.auth.clear, service));
  assert.ok(this.websocketService.connect.calledOnce);
  assert.equal(this.websocketService.connect.firstCall.args[0].encrypted, true);
  assert.ok(this.websocketService.connect.firstCall.args[0].authEndpoint.includes(config.host));
  assert.equal(
    this.websocketService.connect.firstCall.args[0].auth.headers[Constants.REQUEST_HEADER.AUTH],
    authHeader
  );
  assert.equal(this.websocketService.bind.callCount, 4);
  assert.ok(this.websocketService.bind.calledWith(channelName));
  assert.ok(this.websocketService.disconnect.calledOnce);
});

test('cleaning up', function(assert) {
  const service = this.subject();

  this.authService.setProperties({ off: sinon.stub().returnsThis() });

  run(() => service.destroy());
  assert.ok(this.authService.off.calledWith(config.events.auth.success, service));
  assert.ok(this.authService.off.calledWith(config.events.auth.clear, service));
});
