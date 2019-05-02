import Ember from 'ember';
import NotificationsService from 'ember-cli-notifications/services/notification-messages-service';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

const { run } = Ember,
  TYPE_TEXT = 'TEXT',
  TYPE_CALL = 'CALL',
  TYPE_NOTE = 'NOTE';
let server;

moduleFor('adapter:record-item', 'Unit | Adapter | record item', {
  needs: [
    'serializer:record-item',
    'service:auth-service',
    'service:data-service',
    'service:state',
    'service:storage',
    'service:socket',
    'model:contact',
    'model:tag',
    'model:media',
    'model:record-item',
    'model:record-text',
    'model:record-call',
    'model:record-note',
    'transform:record-item-status',
    'validator:number',
    'validator:has-any',
    'validator:inclusion',
  ],
  beforeEach() {
    // see https://github.com/stonecircle/ember-cli-notifications/issues/169
    this.register('service:notifications', NotificationsService);

    server = sinon.createFakeServer({ respondImmediately: true });
  },
  afterEach() {
    server.restore();
  },
});

test('path for type', function(assert) {
  const obj = this.subject();

  assert.equal(obj.pathForType(), 'records');
});

test('building url', function(assert) {
  const obj = this.subject(),
    tId = `${Math.random()}`;

  obj.set('stateService', { ownerAsTeam: Ember.Object.create({ id: tId }) });

  assert.equal(
    obj.buildURL('record-item', 8, null, 'valid type'),
    `/v1/records/8?teamId=${tId}`,
    'team id is always added'
  );
  assert.equal(
    obj.buildURL('record-item', null, null, 'createRecord'),
    `/v1/records?teamId=${tId}`,
    "added team id but not record id because we don't know id when saving a new object"
  );
});

test('getting polymorphic list of items', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    itemBaseline = getStoreCountFor(store, 'record-item'),
    textBaseline = getStoreCountFor(store, 'record-text'),
    callBaseline = getStoreCountFor(store, 'record-call'),
    noteBaseline = getStoreCountFor(store, 'record-note');

  server.respondWith('GET', '/v1/records', xhr => {
    xhr.respond(
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({
        records: [
          { id: Math.random() },
          { id: Math.random(), type: TYPE_TEXT },
          { id: Math.random(), type: TYPE_CALL },
          { id: Math.random(), type: TYPE_NOTE },
        ],
      })
    );
  });

  store.findAll('record-item').then(items => {
    assert.equal(items.get('length'), 1, 'only returns the record-items in the payload');
    assert.equal(
      getStoreCountFor(store, 'record-item'),
      itemBaseline + 1,
      'should be able to get all polymorphic types using the base class too, but this does not work when fetching a list of records'
    );
    assert.equal(getStoreCountFor(store, 'record-text'), textBaseline + 1);
    assert.equal(getStoreCountFor(store, 'record-call'), callBaseline + 1);
    assert.equal(getStoreCountFor(store, 'record-note'), noteBaseline + 1);
  });
});

test('getting polymorphic individual items', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      itemBaseline = getStoreCountFor(store, 'record-item'),
      textBaseline = getStoreCountFor(store, 'record-text'),
      callBaseline = getStoreCountFor(store, 'record-call'),
      noteBaseline = getStoreCountFor(store, 'record-note'),
      done = assert.async();

    let buildSinglePayload;
    server.respondWith('GET', /\/v1\/records\/(\d+)/, (xhr, id) => {
      xhr.respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(buildSinglePayload(id))
      );
    });

    buildSinglePayload = id => {
      return { record: { id } };
    };
    store
      .findRecord('record-item', 1)
      .then(item => {
        assert.equal(item.get('id'), '1');
        assert.equal(item.get('constructor.modelName'), 'record-item');
        assert.equal(getStoreCountFor(store, 'record-item'), itemBaseline + 1);
        assert.equal(getStoreCountFor(store, 'record-text'), textBaseline);
        assert.equal(getStoreCountFor(store, 'record-call'), callBaseline);
        assert.equal(getStoreCountFor(store, 'record-note'), noteBaseline);

        buildSinglePayload = id => {
          return { record: { id, type: TYPE_TEXT } };
        };
        return store.find('record-item', 2);
      })
      .then(text => {
        assert.equal(text.get('id'), '2');
        assert.equal(text.get('constructor.modelName'), 'record-text');
        assert.equal(
          getStoreCountFor(store, 'record-item'),
          itemBaseline + 2,
          'for some reason, when fetching single records, polymorphic records can also be fetched using the base type'
        );
        assert.equal(getStoreCountFor(store, 'record-text'), textBaseline + 1);
        assert.equal(getStoreCountFor(store, 'record-call'), callBaseline);
        assert.equal(getStoreCountFor(store, 'record-note'), noteBaseline);

        buildSinglePayload = id => {
          return { record: { id, type: TYPE_CALL } };
        };
        return store.find('record-item', 3);
      })
      .then(call => {
        assert.equal(call.get('id'), '3');
        assert.equal(call.get('constructor.modelName'), 'record-call');
        assert.equal(
          getStoreCountFor(store, 'record-item'),
          itemBaseline + 3,
          'for some reason, when fetching single records, polymorphic records can also be fetched using the base type'
        );
        assert.equal(getStoreCountFor(store, 'record-text'), textBaseline + 1);
        assert.equal(getStoreCountFor(store, 'record-call'), callBaseline + 1);
        assert.equal(getStoreCountFor(store, 'record-note'), noteBaseline);

        buildSinglePayload = id => {
          return { record: { id, type: TYPE_NOTE } };
        };
        return store.find('record-item', 4);
      })
      .then(note => {
        assert.equal(note.get('id'), '4');
        assert.equal(note.get('constructor.modelName'), 'record-note');
        assert.equal(
          getStoreCountFor(store, 'record-item'),
          itemBaseline + 4,
          'for some reason, when fetching single records, polymorphic records can also be fetched using the base type'
        );
        assert.equal(getStoreCountFor(store, 'record-text'), textBaseline + 1);
        assert.equal(getStoreCountFor(store, 'record-call'), callBaseline + 1);
        assert.equal(getStoreCountFor(store, 'record-note'), noteBaseline + 1);

        done();
      });
  });
});

// Helpers
// -------

function getStoreCountFor(store, modelName) {
  const count = store.peekAll(modelName).get('content.length');
  return count ? count : 0;
}
