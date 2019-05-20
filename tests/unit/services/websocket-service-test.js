import * as Pusher from 'pusher-js';
import * as WebsocketService from 'textup-frontend/services/websocket-service';
import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

// [NOTE] original ES6 class-based source: https://github.com/pusher/pusher-js/blob/v3.1.0/src/core/pusher.ts
// [NOTE] what is actually used after transpilation to use more-broadly implemented JS constructs
//    see: https://github.com/pusher/pusher-js/blob/v3.1.0/dist/web/pusher.js

const { run } = Ember;

moduleFor('service:websocket-service', 'Unit | Service | websocket service');

test('connecting + destroying', function(assert) {
  const service = this.subject(),
    pusherObj1 = { disconnect: sinon.spy() },
    pusherObj2 = { disconnect: sinon.spy() },
    pusherConstructor = sinon.stub(),
    pusherStub = sinon.stub(Pusher, 'default').get(() => pusherConstructor),
    key1 = Math.random(),
    val1 = Math.random();

  pusherConstructor.returns(pusherObj1);
  assert.equal(service.connect({ [key1]: val1 }), pusherObj1);

  assert.ok(pusherConstructor.calledOnce);
  assert.ok(pusherConstructor.calledWithNew);
  assert.equal(pusherConstructor.firstCall.args[0], config.socket.authKey);
  assert.equal(pusherConstructor.firstCall.args[1][key1], val1);
  assert.ok(pusherObj1.disconnect.notCalled);

  pusherConstructor.returns(pusherObj2);
  assert.equal(service.connect(), pusherObj2, 'creates new second connection');

  assert.ok(pusherObj1.disconnect.calledOnce, 'first connection is disconnected');
  assert.ok(pusherConstructor.calledTwice);
  assert.ok(pusherConstructor.secondCall.calledWith(config.socket.authKey, {}));
  assert.ok(pusherObj2.disconnect.notCalled);

  run(() => service.destroy());
  assert.ok(pusherObj2.disconnect.calledOnce, 'existing connections are disconnected on cleanup');

  pusherStub.restore();
});

test('disconnecting', function(assert) {
  const service = this.subject(),
    pusherObj1 = { disconnect: sinon.spy() },
    pusherConstructor = sinon.stub().returns(pusherObj1),
    pusherStub = sinon.stub(Pusher, 'default').get(() => pusherConstructor);

  service.disconnect();
  assert.ok(pusherObj1.disconnect.notCalled);

  service.connect();
  assert.ok(pusherObj1.disconnect.notCalled);

  service.disconnect();
  assert.ok(pusherObj1.disconnect.calledOnce);

  run(() => service.destroy());
  assert.ok(
    pusherObj1.disconnect.calledOnce,
    'disconnect not called on cleanup because already called previously'
  );

  pusherStub.restore();
});

test('binding to events on a channel', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    channelObj = { bind: sinon.stub().returnsThis() },
    pusherObj1 = {
      channel: sinon.stub(),
      subscribe: sinon.stub().returns(channelObj),
      disconnect: sinon.spy(),
    },
    pusherConstructor = sinon.stub().returns(pusherObj1),
    pusherStub = sinon.stub(Pusher, 'default').get(() => pusherConstructor),
    channelName = Math.random(),
    eventName1 = Math.random(),
    eventHandler1 = sinon.spy(),
    eventName2 = Math.random(),
    eventHandler2 = sinon.spy();
  // `bind` before connected
  service
    .bind(channelName, eventName1, eventHandler1)
    .catch(() => {
      assert.ok(pusherConstructor.notCalled);
      assert.ok(pusherObj1.channel.notCalled);
      assert.ok(pusherObj1.subscribe.notCalled);
      assert.ok(pusherObj1.disconnect.notCalled);
      assert.ok(channelObj.bind.notCalled);

      // connect
      assert.equal(service.connect(), pusherObj1);
      assert.ok(pusherConstructor.calledWithNew);
      assert.ok(pusherObj1.channel.notCalled);
      assert.ok(pusherObj1.subscribe.notCalled);
      assert.ok(pusherObj1.disconnect.notCalled);
      assert.ok(channelObj.bind.notCalled);

      // `bind` after connected, before disconnected --> NO existing channel
      pusherObj1.channel.returns(null);
      const retPromise = service.bind(channelName, eventName1, eventHandler1);

      assert.ok(pusherObj1.channel.calledOnce);
      assert.ok(pusherObj1.channel.firstCall.calledWith(channelName));
      assert.ok(pusherObj1.subscribe.calledOnce);
      assert.ok(pusherObj1.subscribe.firstCall.calledWith(channelName));
      assert.equal(channelObj.bind.callCount, 2);
      assert.ok(channelObj.bind.calledWith(WebsocketService.PUSHER_EVENT_FAIL));
      assert.ok(channelObj.bind.calledWith(WebsocketService.PUSHER_EVENT_SUCCESS));
      // WHEN FIRST SUBSCRIBING, get the success args because the promise's `resolve` is in this callback handler
      const successCallArgs = channelObj.bind.args.find(
        fnArgs => fnArgs[0] === WebsocketService.PUSHER_EVENT_SUCCESS
      );
      successCallArgs[1].call();
      return retPromise;
    })
    .then(() => {
      assert.equal(
        channelObj.bind.callCount,
        3,
        'after the channel successful connects, our custom event is finally bound'
      );
      assert.ok(channelObj.bind.calledWith(eventName1, eventHandler1));

      // `bind` after connected, before disconnected --> HAS existing channel
      pusherObj1.channel.resetHistory();
      pusherObj1.subscribe.resetHistory();
      channelObj.bind.resetHistory();
      pusherObj1.channel.returns(channelObj);
      return service.bind(channelName, eventName2, eventHandler2);
    })
    .then(() => {
      assert.ok(pusherObj1.channel.calledOnce);
      assert.ok(pusherObj1.channel.firstCall.calledWith(channelName));
      assert.ok(pusherObj1.subscribe.notCalled);
      assert.ok(
        channelObj.bind.calledOnce,
        'Pusher success and fail already bound when subscribing so only our custom event is bound'
      );
      assert.ok(channelObj.bind.calledWith(eventName2, eventHandler2));

      assert.ok(pusherObj1.disconnect.notCalled);
      service.disconnect();
      assert.ok(pusherObj1.disconnect.calledOnce);

      // `bind` after disconnected
      pusherObj1.channel.resetHistory();
      pusherObj1.subscribe.resetHistory();
      channelObj.bind.resetHistory();
      return service.bind(channelName, eventName2, eventHandler2);
    })
    .catch(() => {
      assert.ok(pusherObj1.channel.notCalled, 'after disconnected, no connection so cannot bind');
      assert.ok(pusherObj1.subscribe.notCalled);
      assert.ok(channelObj.bind.notCalled);

      pusherStub.restore();
      done();
    });
});
