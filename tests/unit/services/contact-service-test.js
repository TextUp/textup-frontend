import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import sinon from 'sinon';
import TestUtils from 'textup-frontend/tests/helpers/utilities';
import wait from 'ember-test-helpers/wait';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:contact-service', 'Unit | Service | contact service', {
  needs: ['service:analytics'],
  beforeEach() {
    this.register('service:dataService', Ember.Service);
    this.register('service:stateService', Ember.Service);
    this.register('service:store', Ember.Service);

    this.inject.service('dataService');
    this.inject.service('stateService');
    this.inject.service('store');
  },
});

test('searching contacts by provided number', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    randNum = Math.random(),
    val1 = Math.random(),
    key1 = Math.random(),
    params = { [key1]: Math.random() };

  this.store.setProperties({ query: sinon.stub().resolves(val1) });

  service.searchContactsByNumber(randNum, params).then(retVal => {
    assert.equal(retVal, val1);
    assert.ok(this.store.query.calledOnce);
    assert.equal(this.store.query.firstCall.args[0], 'contact');
    assert.equal(this.store.query.firstCall.args[1][key1], params[key1]);
    assert.equal(this.store.query.firstCall.args[1].search, randNum);
    assert.notOk(
      this.store.query.firstCall.args[1].teamId,
      'do not add teamId here because will be added by contact adapter'
    );

    done();
  });
});

test('finding duplicate contacts that have the same number', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    val1 = Math.random(),
    addedNum = Math.random(),
    resultObj = Ember.Object.create({ toArray: sinon.stub().returns([val1]) }),
    contactObj = Ember.Object.create({ addDuplicatesForNumber: sinon.spy() });

  service.setProperties({ searchContactsByNumber: sinon.stub().resolves(resultObj) });

  service.checkNumberDuplicate(contactObj, null);
  assert.ok(service.searchContactsByNumber.notCalled);
  assert.ok(contactObj.addDuplicatesForNumber.notCalled);

  service.checkNumberDuplicate(contactObj, addedNum);
  wait().then(() => {
    assert.ok(service.searchContactsByNumber.calledOnce);
    assert.ok(service.searchContactsByNumber.calledWith(addedNum));
    assert.ok(contactObj.addDuplicatesForNumber.calledOnce);
    assert.ok(contactObj.addDuplicatesForNumber.calledWith(addedNum, [val1]));

    done();
  });
});

test('removing contact duplicates given a specific number', function(assert) {
  const service = this.subject(),
    removedNum = Math.random(),
    contactObj = Ember.Object.create({ removeDuplicatesForNumber: sinon.spy() });

  service.removeNumberDuplicate(contactObj, null);
  assert.ok(contactObj.removeDuplicatesForNumber.notCalled);

  service.removeNumberDuplicate(contactObj, removedNum);
  assert.ok(contactObj.removeDuplicatesForNumber.calledOnce);
  assert.ok(contactObj.removeDuplicatesForNumber.calledWith(removedNum));
});

test('persisting a new contact and trying to add that contact to the current phone', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    contactObj = Ember.Object.create(),
    phone = TestUtils.mockModel(1, Constants.MODEL.PHONE, { addContacts: sinon.spy() });

  this.stateService.setProperties({ viewingContacts: true, owner: { phone: { content: phone } } });
  this.dataService.setProperties({ persist: sinon.stub().resolves() });

  service.persistNewAndTryAddToPhone(contactObj).then(() => {
    assert.ok(this.dataService.persist.calledOnce);
    assert.ok(this.dataService.persist.calledWith(contactObj));
    assert.ok(phone.addContacts.calledOnce);
    assert.ok(phone.addContacts.calledWith(contactObj));

    done();
  });
});

test('creating new contact with language default', function(assert) {
  const service = this.subject(),
    val1 = Math.random(),
    val2 = Math.random();

  this.store.setProperties({ createRecord: sinon.stub().returns(val2) });
  this.stateService.setProperties({ owner: { phone: { content: { language: val1 } } } });

  assert.equal(service.createNew(), val2);
  assert.ok(this.store.createRecord.calledOnce);
  assert.ok(this.store.createRecord.calledWith(Constants.MODEL.CONTACT, { language: val1 }));
});
