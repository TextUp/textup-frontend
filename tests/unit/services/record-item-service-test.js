import Ember from 'ember';
import Location from 'textup-frontend/models/location';
import RecordCall from 'textup-frontend/models/record-call';
import RecordNote from 'textup-frontend/models/record-note';
import RecordText from 'textup-frontend/models/record-text';
import sinon from 'sinon';
import { mockModel } from 'textup-frontend/tests/helpers/utilities';
import { moduleFor, test } from 'ember-qunit';

const { typeOf, RSVP, run } = Ember;

moduleFor('service:record-item-service', 'Unit | Service | record item service', {
  needs: [
    'service:constants',
    'model:contact',
    'model:location',
    'model:media',
    'model:media/add',
    'model:media-element',
    'model:media-element-version',
    'model:record-item',
    'model:record-note-revision',
    'model:tag',
    'model:record-item',
    'model:record-call',
    'model:record-note',
    'model:record-text',
    'transform:record-item-status',
    'validator:has-any',
    'validator:inclusion',
    'validator:number',
    'validator:presence'
  ],
  beforeEach() {
    this.register('service:data-service', Ember.Service);
    this.inject.service('data-service', { as: 'dataService' });
    this.inject.service('store');
    this.inject.service('constants');
  }
});

test('loading more record items for contact', function(assert) {
  const done = assert.async(),
    service = this.subject(),
    numRecordItems = 100,
    model = mockModel(88, this.constants.MODEL.CONTACT, { numRecordItems }),
    queryStub = sinon.stub(this.store, 'query').returns(new RSVP.Promise(resolve => resolve({})));
  service.setProperties({ dataService: { buildErrorHandler: sinon.stub() } });

  service.loadRecordItems(model).then(results => {
    assert.equal(typeOf(results), 'object');
    assert.ok(service.dataService.buildErrorHandler.calledOnce);

    assert.ok(queryStub.calledOnce);
    assert.equal(queryStub.firstCall.args[0], 'record-item');
    assert.deepEqual(queryStub.firstCall.args[1], {
      contactId: model.id,
      max: 20,
      offset: numRecordItems
    });

    queryStub.restore();
    done();
  });
});

test('loading more record items for tag', function(assert) {
  const done = assert.async(),
    service = this.subject(),
    numRecordItems = 88,
    model = mockModel(888, this.constants.MODEL.TAG, { numRecordItems }),
    queryStub = sinon.stub(this.store, 'query').returns(new RSVP.Promise(resolve => resolve({})));
  service.setProperties({ dataService: { buildErrorHandler: sinon.stub() } });

  service.loadRecordItems(model).then(results => {
    assert.equal(typeOf(results), 'object');
    assert.ok(service.dataService.buildErrorHandler.calledOnce);

    assert.ok(queryStub.calledOnce);
    assert.equal(queryStub.firstCall.args[0], 'record-item');
    assert.deepEqual(queryStub.firstCall.args[1], {
      tagId: model.id,
      max: 20,
      offset: numRecordItems
    });

    queryStub.restore();
    done();
  });
});

test('refreshing all record items', function(assert) {
  const done = assert.async(),
    service = this.subject(),
    numRecordItems = 88,
    model = mockModel(888, this.constants.MODEL.TAG, { numRecordItems }),
    queryStub = sinon.stub(this.store, 'query').returns(new RSVP.Promise(resolve => resolve({})));
  service.setProperties({ dataService: { buildErrorHandler: sinon.stub() } });

  service.loadRecordItems(model, { refresh: true }).then(results => {
    assert.equal(typeOf(results), 'object');
    assert.ok(service.dataService.buildErrorHandler.calledOnce);

    assert.ok(queryStub.calledOnce);
    assert.equal(queryStub.firstCall.args[0], 'record-item');
    assert.notOk(
      queryStub.firstCall.args[1].offset,
      'no offset when we are refreshing because we want to load the very first items'
    );

    queryStub.restore();
    done();
  });
});

test('make call', function(assert) {
  run(() => {
    const service = this.subject(),
      cBaseline = this.store.peekAll('record-call').get('length'),
      retVal = Math.random();

    service.setProperties({ dataService: { persist: sinon.stub().returns(retVal) } });

    assert.equal(service.makeCall('111 222 3333'), retVal);

    assert.equal(this.store.peekAll('record-call').get('length'), cBaseline + 1);

    assert.ok(service.dataService.persist.calledOnce);
    assert.ok(service.dataService.persist.firstCall.args[0] instanceof RecordCall);
    assert.equal(service.dataService.persist.firstCall.args[0].get('numRecipients'), 1);
  });
});

test('creating new text', function(assert) {
  run(() => {
    const service = this.subject(),
      tBaseline = this.store.peekAll('record-text').get('length');

    let rText = service.createNewText('111 222 3333');
    assert.ok(rText instanceof RecordText);

    assert.equal(this.store.peekAll('record-text').get('length'), tBaseline + 1);
    assert.equal(rText.get('numRecipients'), 1);

    rText = service.createNewText(['111 222 3333', '111 222 8889']);
    assert.ok(rText instanceof RecordText);

    assert.equal(this.store.peekAll('record-text').get('length'), tBaseline + 2);
    assert.equal(rText.get('numRecipients'), 2);
  });
});

test('creating new note', function(assert) {
  run(() => {
    const service = this.subject(),
      nBaseline = this.store.peekAll('record-note').get('length');

    let rNote = service.createNewNote('111 222 3333');
    assert.ok(rNote instanceof RecordNote);

    assert.equal(this.store.peekAll('record-note').get('length'), nBaseline + 1);
    assert.equal(rNote.get('numRecipients'), 1);
    assert.notOk(rNote.get('addAfterDate'));

    const addAfterObj = { whenCreated: Math.random() };
    rNote = service.createNewNote('111 222 3333', addAfterObj);
    assert.ok(rNote instanceof RecordNote);

    assert.equal(this.store.peekAll('record-note').get('length'), nBaseline + 2);
    assert.equal(rNote.get('numRecipients'), 1);
    assert.equal(rNote.get('addAfterDate'), addAfterObj.whenCreated);
  });
});

test('adding location to note', function(assert) {
  run(() => {
    const service = this.subject(),
      lBaseline = this.store.peekAll('location').get('length'),
      mockNote = Ember.Object.create();

    service.addLocationToNote(mockNote);

    assert.ok(mockNote.get('location') instanceof Location);
    assert.equal(this.store.peekAll('location').get('length'), lBaseline + 1);
  });
});

test('removing location from note', function(assert) {
  run(() => {
    const service = this.subject(),
      rollbackSpy = sinon.spy(),
      mockNote = Ember.Object.create({
        location: { content: { rollbackAttributes: rollbackSpy } }
      });

    service.removeLocationFromNote(mockNote);

    assert.notOk(mockNote.get('location'));
    assert.ok(rollbackSpy.calledOnce);
  });
});
