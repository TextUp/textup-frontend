import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

const { RSVP } = Ember;

moduleFor('service:tag-service', 'Unit | Service | tag service', {
  needs: ['service:analytics'],
  beforeEach() {
    this.register('service:dataService', Ember.Service);
    this.register('service:state', Ember.Service);
    this.register('service:store', Ember.Service);

    this.inject.service('dataService');
    this.inject.service('state');
    this.inject.service('store');
  },
});

test('creating new tag with language default', function(assert) {
  const service = this.subject(),
    val1 = Math.random(),
    val2 = Math.random();

  this.store.setProperties({ createRecord: sinon.stub().returns(val1) });
  this.state.setProperties({ owner: { phone: { content: { language: val2 } } } });

  assert.equal(service.createNew(), val1);
  assert.ok(this.store.createRecord.calledOnce);
  assert.ok(this.store.createRecord.calledWith(Constants.MODEL.TAG, { language: val2 }));
});

test('persisting new tag', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    tags = [],
    phoneObj = Ember.Object.create({ tags: new RSVP.Promise(resolves => resolves(tags)) }),
    modelObj = Ember.Object.create({ phone: new RSVP.Promise(resolves => resolves(phoneObj)) }),
    tagObj = Ember.Object.create();

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
    contactObj = Ember.Object.create({ reload: sinon.stub().resolves() }),
    tagObj = Ember.Object.create();

  this.dataService.setProperties({
    persist: sinon.stub().resolves(),
    request: sinon.stub().resolves(),
  });

  service.updateTagMemberships([tagObj], [contactObj]).then(() => {
    assert.ok(this.dataService.persist.calledOnce);
    assert.ok(this.dataService.persist.calledWith([tagObj]));
    assert.ok(contactObj.reload.calledOnce);
    assert.ok(this.dataService.request.calledOnce);

    done();
  });
});
