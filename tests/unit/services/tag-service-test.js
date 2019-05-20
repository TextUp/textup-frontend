import EmberObject from '@ember/object';
import Service from '@ember/service';
import RSVP from 'rsvp';
import Constants from 'textup-frontend/constants';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:tag-service', 'Unit | Service | tag service', {
  needs: ['service:analytics'],
  beforeEach() {
    this.register('service:dataService', Service);
    this.inject.service('dataService');
    this.register('service:requestService', Service);
    this.inject.service('requestService');
    this.register('service:stateService', Service);
    this.inject.service('stateService');
    this.register('service:store', Service);
    this.inject.service('store');
  },
});

test('creating new tag with language default', function(assert) {
  const service = this.subject(),
    val1 = Math.random(),
    val2 = Math.random();

  this.store.setProperties({ createRecord: sinon.stub().returns(val1) });
  this.stateService.setProperties({ owner: { phone: { content: { language: val2 } } } });

  assert.equal(service.createNew(), val1);
  assert.ok(this.store.createRecord.calledOnce);
  assert.ok(this.store.createRecord.calledWith(Constants.MODEL.TAG, { language: val2 }));
});

test('persisting new tag', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    tags = [],
    phoneObj = EmberObject.create({ tags: new RSVP.Promise(resolves => resolves(tags)) }),
    modelObj = EmberObject.create({ phone: new RSVP.Promise(resolves => resolves(phoneObj)) }),
    tagObj = EmberObject.create();

  this.dataService.setProperties({ persist: sinon.stub().resolves() });

  service.persistNew(tagObj, { model: modelObj }).then(() => {
    assert.ok(this.dataService.persist.calledOnce);
    assert.ok(this.dataService.persist.calledWith(tagObj));

    assert.equal(tags.length, 1, "passed-in tag was added to phone's tag array");
    assert.equal(tags[0], tagObj);

    done();
  });
});

test('updating tag membership', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    contactObj = EmberObject.create({ reload: sinon.stub().resolves() }),
    tagObj = EmberObject.create();

  this.dataService.setProperties({ persist: sinon.stub().resolves() });
  this.requestService.setProperties({ handleIfError: sinon.stub().returnsArg(0) });

  service.updateTagMemberships([tagObj], [contactObj]).then(() => {
    assert.ok(this.dataService.persist.calledOnce);
    assert.ok(this.dataService.persist.calledWith([tagObj]));
    assert.ok(contactObj.reload.calledOnce);
    assert.ok(this.requestService.handleIfError.calledOnce);

    done();
  });
});
