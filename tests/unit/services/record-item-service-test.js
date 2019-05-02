import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import FileUtils from 'textup-frontend/utils/file';
import Location from 'textup-frontend/models/location';
import moment from 'moment';
import RecordCall from 'textup-frontend/models/record-call';
import RecordNote from 'textup-frontend/models/record-note';
import RecordText from 'textup-frontend/models/record-text';
import sinon from 'sinon';
import { mockModel } from 'textup-frontend/tests/helpers/utilities';
import { moduleFor, test } from 'ember-qunit';

const { typeOf, RSVP, run } = Ember;

moduleFor('service:record-item-service', 'Unit | Service | record item service', {
  needs: [
    'model:contact',
    'model:location',
    'model:media',
    'model:media-element',
    'model:media-element-version',
    'model:media/add',
    'model:record-call',
    'model:record-item',
    'model:record-item',
    'model:record-note',
    'model:record-note-revision',
    'model:record-text',
    'model:tag',
    'transform:record-item-status',
    'validator:has-any',
    'validator:inclusion',
    'validator:number',
    'validator:presence',
  ],
  beforeEach() {
    this.register('service:data-service', Ember.Service);
    this.inject.service('data-service', { as: 'dataService' });
    this.inject.service('store');
  },
});

test('building required query parameters for particular record owners', function(assert) {
  const service = this.subject(),
    emptyResult = { owners: [] },
    mockTag = mockModel(Math.random(), Constants.MODEL.TAG),
    mockContact = mockModel(Math.random(), Constants.MODEL.CONTACT, { isShared: false }),
    mockShared = mockModel(Math.random(), Constants.MODEL.CONTACT, { isShared: true });

  assert.deepEqual(service._buildQueryFor(), emptyResult);
  assert.deepEqual(service._buildQueryFor(null), emptyResult);
  assert.deepEqual(service._buildQueryFor('not an array'), emptyResult);
  assert.deepEqual(service._buildQueryFor({}), emptyResult);
  assert.deepEqual(service._buildQueryFor([]), emptyResult);

  let resObj = service._buildQueryFor([mockTag, mockContact, mockShared]);
  assert.equal(resObj.owners.length, 3);
  assert.ok(resObj.owners.indexOf(mockTag.id) > -1);
  assert.ok(resObj.owners.indexOf(mockContact.id) > -1);
  assert.ok(resObj.owners.indexOf(mockShared.id) > -1);
});

test('handling export outcome', function(assert) {
  const service = this.subject(),
    resolveSpy = sinon.spy(),
    rejectSpy = sinon.spy(),
    getFileNameStub = sinon.stub(FileUtils, 'tryGetFileNameFromXHR'),
    downloadStub = sinon.stub(FileUtils, 'download'),
    response = Math.random();

  service._handleExportOutcome({ status: 'not 200', response }, resolveSpy, rejectSpy);

  assert.ok(resolveSpy.notCalled);
  assert.ok(getFileNameStub.notCalled);
  assert.ok(downloadStub.notCalled);
  assert.ok(rejectSpy.calledOnce);

  service._handleExportOutcome({ status: 200, response }, resolveSpy, rejectSpy);

  assert.ok(resolveSpy.calledOnce);
  assert.ok(getFileNameStub.calledOnce);
  assert.ok(downloadStub.calledOnce);
  assert.equal(downloadStub.firstCall.args[0], response);
  assert.ok(rejectSpy.calledOnce);

  getFileNameStub.restore();
  downloadStub.restore();
});

test('loading more record items for contact', function(assert) {
  const done = assert.async(),
    service = this.subject(),
    numRecordItems = 100,
    model = mockModel(88, Constants.MODEL.CONTACT, { numRecordItems }),
    queryStub = sinon.stub(this.store, 'query').returns(new RSVP.Promise(resolve => resolve({})));
  service.setProperties({ dataService: { request: sinon.stub().returnsArg(0) } });

  service.loadRecordItems(model).then(results => {
    assert.equal(typeOf(results), 'object');
    assert.ok(service.dataService.request.calledOnce);

    assert.ok(queryStub.calledOnce);
    assert.equal(queryStub.firstCall.args[0], 'record-item');
    assert.deepEqual(queryStub.firstCall.args[1], {
      owners: [model.id],
      max: 20,
      offset: numRecordItems,
    });

    queryStub.restore();
    done();
  });
});

test('loading more record items for tag', function(assert) {
  const done = assert.async(),
    service = this.subject(),
    numRecordItems = 88,
    model = mockModel(888, Constants.MODEL.TAG, { numRecordItems }),
    queryStub = sinon.stub(this.store, 'query').returns(new RSVP.Promise(resolve => resolve({})));
  service.setProperties({ dataService: { request: sinon.stub().returnsArg(0) } });

  service.loadRecordItems(model).then(results => {
    assert.equal(typeOf(results), 'object');
    assert.ok(service.dataService.request.calledOnce);

    assert.ok(queryStub.calledOnce);
    assert.equal(queryStub.firstCall.args[0], 'record-item');
    assert.deepEqual(queryStub.firstCall.args[1], {
      owners: [model.id],
      max: 20,
      offset: numRecordItems,
    });

    queryStub.restore();
    done();
  });
});

test('refreshing all record items', function(assert) {
  const done = assert.async(),
    service = this.subject(),
    numRecordItems = 88,
    model = mockModel(888, Constants.MODEL.TAG, { numRecordItems }),
    queryStub = sinon.stub(this.store, 'query').returns(new RSVP.Promise(resolve => resolve({})));
  service.setProperties({ dataService: { request: sinon.stub().returnsArg(0) } });

  service.loadRecordItems(model, { refresh: true }).then(results => {
    assert.equal(typeOf(results), 'object');
    assert.ok(service.dataService.request.calledOnce);

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

test('exporting record items', function(assert) {
  // build inputs
  const start = moment().subtract(2, 'days'),
    end = moment().add(1, 'day'),
    teamId = Math.random(),
    tagId = Math.random(),
    tz = Math.random(),
    mockTag = mockModel(tagId, Constants.MODEL.TAG);
  // build mocks
  const done = assert.async(),
    service = this.subject(),
    fakeXhr = sinon.useFakeXMLHttpRequest(),
    requests = [],
    handleExportOutcomeStub = sinon.stub(service, '_handleExportOutcome');
  fakeXhr.onCreate = req1 => requests.pushObject(req1);

  service.setProperties({
    stateService: Ember.Object.create({ ownerAsTeam: { id: teamId } }),
    authService: Ember.Object.create({ timezone: tz }),
  });

  // call done to ensure to promise return value is respected
  service.exportRecordItems(start, end, true, [mockTag]).then(done);

  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, 'GET');
  assert.equal(requests[0].responseType, 'arraybuffer');
  assert.ok(requests[0].requestHeaders['Content-Type'].indexOf('application/pdf') > -1);
  assert.ok(requests[0].requestHeaders['Authorization'].indexOf('Bearer') > -1);

  // For `escape` vs `encodeURI` vs `encodeURIComponent` see https://stackoverflow.com/a/23842171
  assert.ok(requests[0].url.includes(`teamId=${encodeURIComponent(teamId)}`));
  assert.ok(requests[0].url.includes(`timezone=${encodeURIComponent(tz)}`));
  assert.ok(requests[0].url.includes(`format=${encodeURIComponent(Constants.EXPORT.FORMAT.PDF)}`));
  assert.ok(requests[0].url.includes(`max=${encodeURIComponent(Constants.EXPORT.LARGEST_MAX)}`));
  assert.ok(requests[0].url.includes(`start=${encodeURIComponent(start.toISOString())}`));

  assert.ok(requests[0].url.includes(`end=${encodeURIComponent(end.toISOString())}`));
  assert.ok(
    requests[0].url.includes(
      `exportFormatType=${encodeURIComponent(Constants.EXPORT.TYPE.GROUPED)}`
    )
  );
  assert.ok(requests[0].url.includes(encodeURI(`owners[]=${encodeURIComponent(tagId)}`)));

  requests[0].respond(200);

  assert.ok(handleExportOutcomeStub.calledOnce);
  assert.equal(handleExportOutcomeStub.firstCall.args[0], requests[0]);
  handleExportOutcomeStub.firstCall.args[1].call(); // resolve

  fakeXhr.restore();
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

test('end ongoing call', function(assert) {
  run(() => {
    const service = this.subject(),
      rCall = this.store.createRecord('record-call');
    service.setProperties({ dataService: { persist: sinon.spy() } });

    service.endOngoingCall();
    assert.ok(service.dataService.persist.notCalled);

    service.endOngoingCall(rCall);
    assert.ok(service.dataService.persist.calledOnce);
    assert.equal(service.dataService.persist.firstCall.args[0], rCall);
    assert.equal(rCall.get('endOngoing'), true);
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
        location: { content: { rollbackAttributes: rollbackSpy } },
      });

    service.removeLocationFromNote(mockNote);

    assert.notOk(mockNote.get('location'));
    assert.ok(rollbackSpy.calledOnce);
  });
});
