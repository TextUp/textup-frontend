import EmberObject from '@ember/object';
import Service from '@ember/service';
import Constants from 'textup-frontend/constants';
import PhoneNumberUtils from 'textup-frontend/utils/phone-number';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:compose-slideout-service', 'Unit | Service | compose slideout service', {
  needs: ['service:analytics'],
  beforeEach() {
    this.register('service:store', Service);
    this.inject.service('store');
  },
});

test('creating compose recipient', function(assert) {
  const service = this.subject(),
    invalidNum = 'invalid',
    validNum = '626 291 3019';

  assert.notOk(service.createRecipient(null));
  assert.notOk(service.createRecipient(invalidNum));
  assert.deepEqual(service.createRecipient(validNum), {
    [Constants.PROP_NAME.URL_IDENT]: PhoneNumberUtils.clean(validNum),
    [Constants.PROP_NAME.READABLE_IDENT]: PhoneNumberUtils.clean(validNum),
    [Constants.PROP_NAME.FILTER_VAL]: PhoneNumberUtils.clean(validNum),
  });
});

test('searching for recipients', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    searchVal = Math.random(),
    val1 = Math.random(),
    resultObj = EmberObject.create({ toArray: sinon.stub().returns([val1]) });

  this.store.setProperties({ query: sinon.stub().resolves(resultObj) });

  service
    .doSearch(null)
    .then(retVal => {
      assert.deepEqual(retVal, []);
      assert.ok(this.store.query.notCalled);

      return service.doSearch(searchVal);
    })
    .then(retVal => {
      assert.deepEqual(retVal, [val1]);
      assert.ok(this.store.query.calledOnce);
      assert.ok(this.store.query.calledWith(Constants.MODEL.CONTACT, { search: searchVal }));

      done();
    });
});
