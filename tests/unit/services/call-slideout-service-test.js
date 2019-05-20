import EmberObject from '@ember/object';
import Service from '@ember/service';
import Constants from 'textup-frontend/constants';
import PhoneNumberUtils from 'textup-frontend/utils/phone-number';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:call-slideout-service', 'Unit | Service | call slideout service', {
  needs: ['service:analytics'],
  beforeEach() {
    this.register('service:contactService', Service);
    this.inject.service('contactService');
    this.register('service:recordItemService', Service);
    this.inject.service('recordItemService');
    this.register('service:store', Service);
    this.inject.service('store');
    this.register('service:requestService', Service);
    this.inject.service('requestService');
  },
});

test('validating and check for name of an existing contact is debounced', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    ctx = EmberObject.create(),
    invalidNum = 'invalid',
    validNum = '626 129 1029',
    result1 = EmberObject.create({ isViewPermission: true }),
    result2 = EmberObject.create({ isViewPermission: false }),
    resultObj = EmberObject.create({ toArray: sinon.stub().returns([result1, result2, result2]) });

  this.contactService.setProperties({ searchContactsByNumber: sinon.stub().resolves(resultObj) });

  service.validateAndCheckForName(validNum, { ctx });
  service.validateAndCheckForName(validNum, { ctx });
  service.validateAndCheckForName(validNum, { ctx });
  wait()
    .then(() => {
      assert.ok(this.contactService.searchContactsByNumber.calledOnce);
      assert.ok(
        this.contactService.searchContactsByNumber.calledWith(PhoneNumberUtils.clean(validNum))
      );

      assert.equal(ctx.get('callByNumber'), PhoneNumberUtils.clean(validNum));
      assert.equal(ctx.get('callByNumberContact'), result2);
      assert.equal(ctx.get('callByNumberIsValid'), true);
      assert.equal(ctx.get('callByNumberMoreNum'), 1);

      service.validateAndCheckForName(invalidNum, { ctx });
      return wait();
    })
    .then(() => {
      assert.ok(this.contactService.searchContactsByNumber.calledOnce);

      assert.equal(ctx.get('callByNumber'), PhoneNumberUtils.clean(invalidNum));
      assert.equal(ctx.get('callByNumberContact'), null);
      assert.equal(ctx.get('callByNumberIsValid'), false);
      assert.equal(ctx.get('callByNumberMoreNum'), 0);

      done();
    });
});

test('making call', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    number = Math.random(),
    contactObj1 = EmberObject.create(),
    contactObj2 = EmberObject.create();

  this.store.setProperties({ createRecord: sinon.stub().returns(contactObj2) });
  this.contactService.setProperties({
    persistNewAndTryAddToPhone: sinon.stub().resolves(contactObj2),
  });
  this.requestService.setProperties({ handleIfError: sinon.stub().returnsArg(0) });
  this.recordItemService.setProperties({ makeCall: sinon.stub().resolves() });

  service
    .makeCall(contactObj1, null)
    .then(retVal => {
      assert.equal(retVal, contactObj1, 'existing contact');
      assert.ok(this.store.createRecord.notCalled);
      assert.ok(this.contactService.persistNewAndTryAddToPhone.notCalled);
      assert.ok(this.requestService.handleIfError.calledOnce);
      assert.ok(this.recordItemService.makeCall.calledOnce);
      assert.ok(this.recordItemService.makeCall.firstCall.calledWith(contactObj1));

      return service.makeCall(null, number);
    })
    .then(retVal => {
      assert.equal(retVal, contactObj2, 'newly created contact');
      assert.ok(this.store.createRecord.calledOnce);
      assert.ok(
        this.store.createRecord.calledWith(Constants.MODEL.CONTACT, { numbers: [{ number }] })
      );
      assert.ok(this.contactService.persistNewAndTryAddToPhone.calledOnce);
      assert.ok(this.contactService.persistNewAndTryAddToPhone.calledWith(contactObj2));
      assert.ok(this.requestService.handleIfError.calledTwice);
      assert.ok(this.recordItemService.makeCall.calledTwice);
      assert.ok(this.recordItemService.makeCall.secondCall.calledWith(contactObj2));

      done();
    });
});
