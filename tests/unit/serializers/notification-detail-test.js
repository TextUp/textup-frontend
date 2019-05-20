import { run } from '@ember/runloop';
import Constants from 'textup-frontend/constants';
import sinon from 'sinon';
import { moduleForModel, test } from 'ember-qunit';

let server;

moduleForModel('notification-detail', 'Unit | Serializer | notification detail', {
  needs: [
    'model:contact',
    'model:media',
    'model:record-item',
    'model:record-text',
    'model:tag',
    'serializer:notification-detail',
    'transform:record-item-status',
    'validator:has-any',
    'validator:number',
  ],
  beforeEach() {
    server = sinon.createFakeServer({ respondImmediately: true });
  },
  afterEach() {
    server.restore();
  },
});

test('it serializes records', function(assert) {
  const detailId = 8,
    textId = Math.random(),
    done = assert.async();
  server.respondWith('GET', '/notification-details/' + detailId, xhr => {
    xhr.respond(
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({
        'notification-detail': { id: detailId, items: [{ id: textId, type: 'TEXT' }] },
      })
    );
  });

  run(() => {
    this.store()
      .findRecord('notification-detail', detailId)
      .then(detail => {
        assert.equal(detail.get('_recordItems.content.length'), 1);
        assert.equal(detail.get('_recordItems.content.firstObject.id'), textId);
        assert.equal(
          detail.get('_recordItems.content.firstObject.constructor.modelName'),
          Constants.MODEL.RECORD_TEXT
        );

        done();
      });
  });
});
