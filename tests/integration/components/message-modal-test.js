import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

let server;

moduleForComponent('message-modal', 'Integration | Component | message modal', {
  integration: true,
  beforeEach() {
    server = sinon.createFakeServer({ respondImmediately: true });
    this.register('service:storageService', Ember.Service);
    this.inject.service('storageService');
  },
  afterEach() {
    server.restore();
  },
});

test('inputs', function(assert) {
  this.setProperties({
    url: 'http://www.example.com',
    onClose: () => {},
  });

  assert.throws(() => this.render(hbs`{{message-modal}}`), 'requires message location url');

  assert.notOk(Ember.$('.ember-view').length, 'did NOT render');

  this.render(hbs`{{message-modal url=url onClose=onClose}}`);

  assert.ok(Ember.$('.ember-view').length, 'did render');
});

test('manually controlling hide/show + rerendering on url change', function(assert) {
  const url = 'http://www.example.com',
    url2 = 'http://www.textup.org',
    onClose = sinon.spy(),
    done = assert.async();

  this.setProperties({ url, display: false, onClose });

  this.render(hbs`{{message-modal url=url display=display onClose=onClose}}`);

  assert.notOk(Ember.$('.textup-modal').length, 'do not show because flag is false');
  assert.ok(onClose.notCalled);

  this.set('display', true);
  wait()
    .then(() => {
      assert.ok(Ember.$('.textup-modal').length, 'do show because flag is now true');
      assert.ok(onClose.notCalled);

      assert.ok(Ember.$('.textup-modal button').length, 'has close button');
      Ember.$('.textup-modal button')
        .first()
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok(onClose.calledOnce);

      this.set('display', false);
      return wait();
    })
    .then(() => {
      assert.notOk(Ember.$('.textup-modal').length, 'do not show because flag is false');

      this.set('display', true);
      return wait();
    })
    .then(() => {
      assert.ok(Ember.$('.textup-modal').length, 'do show because flag is now true');

      this.set('url', url2);
      assert.ok(
        Ember.$('.textup-modal .textup-modal__body__message').length,
        'is displaying loading message'
      );
      return wait();
    })
    .then(() => {
      assert.ok(Ember.$('.textup-modal').length);

      done();
    });
});

test('controlling display via oldest threshold', function(assert) {
  const url = `http://www.example.com/${Math.random()}`,
    lastModified = moment()
      .subtract(1, 'day')
      .toISOString(),
    lastViewed = moment().toISOString(),
    done = assert.async();

  this.storageService.setProperties({ setItem: sinon.spy(), getItem: sinon.stub() });

  this.setProperties({ url });

  server.respondWith('GET', url, xhr => {
    xhr.respond(200, { 'Content-Type': 'text/html', 'last-modified': lastModified }, 'OK');
  });

  this.storageService.getItem.returns(null);
  this.render(hbs`{{message-modal url=url display=30}}`);
  wait()
    .then(() => {
      assert.equal(server.requests.length, 1);
      assert.ok(this.storageService.getItem.calledWith(url));
      assert.ok(
        this.storageService.setItem.calledWith(url),
        'update last viewed if we show the modal'
      );
      assert.ok(Ember.$('.textup-modal').length, 'modal is displayed');

      this.storageService.getItem.resetHistory();
      this.storageService.setItem.resetHistory();
      this.storageService.getItem.returns(lastViewed);
      this.render(hbs`{{message-modal url=url display=30}}`);
      return wait();
    })
    .then(() => {
      assert.equal(server.requests.length, 2);
      assert.ok(this.storageService.getItem.calledWith(url));
      assert.ok(
        this.storageService.setItem.notCalled,
        'do not update last viewed because we do not show the modal'
      );
      assert.notOk(
        Ember.$('.textup-modal').length,
        'modal is not displayed because last viewed timestamp is newer than last modified'
      );

      done();
    });
});
