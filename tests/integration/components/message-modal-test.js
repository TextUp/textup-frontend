/* global localStorage */

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
  },
  afterEach() {
    server.restore();
  }
});

test('inputs', function(assert) {
  this.setProperties({
    url: 'http://www.example.com',
    onClose: () => {}
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
    lastModified = moment().toISOString(),
    done = assert.async();

  this.setProperties({ url });
  localStorage.removeItem(url);

  server.respondWith('GET', url, xhr => {
    xhr.respond(200, { 'Content-Type': 'text/html', 'last-modified': lastModified }, 'OK');
  });

  this.render(hbs`{{message-modal url=url display=30}}`);
  wait()
    .then(() => {
      assert.equal(server.requests.length, 1);
      assert.ok(
        moment(localStorage.getItem(url)).isAfter(lastModified),
        'when this url has been accessed is stored in local storage'
      );
      assert.ok(Ember.$('.textup-modal').length, 'modal is displayed');

      this.render(hbs`{{message-modal url=url display=30}}`);
      return wait();
    })
    .then(() => {
      assert.equal(server.requests.length, 2);
      assert.notOk(
        Ember.$('.textup-modal').length,
        'modal is not displayed because last viewed timestamp is newer than last modified'
      );

      localStorage.removeItem(url);
      done();
    });
});
