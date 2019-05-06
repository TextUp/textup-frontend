import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import sinon from 'sinon';
import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:data-service', 'Unit | Service | data service', {
  needs: ['service:analytics'],
  beforeEach() {
    this.register('service:loadingSlider', Ember.Service);
    this.inject.service('loadingSlider');
    this.register('service:requestService', Ember.Service);
    this.inject.service('requestService');
  },
});

test('marking models for delete', function(assert) {
  const service = this.subject(),
    notModelObj = Ember.Object.create({
      isNew: true,
      rollbackAttributes: sinon.spy(),
      deleteRecord: sinon.spy(),
    }),
    newObj = TestUtils.mockModel(1, Constants.MODEL.STAFF, {
      isNew: true,
      rollbackAttributes: sinon.spy(),
      deleteRecord: sinon.spy(),
    }),
    oldObj = TestUtils.mockModel(2, Constants.MODEL.STAFF, {
      isNew: false,
      rollbackAttributes: sinon.spy(),
      deleteRecord: sinon.spy(),
    });

  service.markForDelete(notModelObj);
  assert.ok(notModelObj.rollbackAttributes.notCalled);
  assert.ok(notModelObj.deleteRecord.notCalled);

  service.markForDelete(newObj);
  assert.ok(newObj.rollbackAttributes.calledOnce);
  assert.ok(newObj.deleteRecord.notCalled);

  service.markForDelete([oldObj, newObj]);
  assert.ok(oldObj.rollbackAttributes.notCalled);
  assert.ok(oldObj.deleteRecord.calledOnce);
  assert.ok(newObj.rollbackAttributes.calledTwice);
  assert.ok(newObj.deleteRecord.notCalled);
});

test('persisting changes in models', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    val1 = Math.random(),
    val2 = Math.random(),
    then1 = sinon.spy(),
    then2 = sinon.spy(),
    nonDirtyObj = TestUtils.mockModel(1, Constants.MODEL.ORG, { isDirty: false }),
    dirtySuccessObj = TestUtils.mockModel(2, Constants.MODEL.ORG, {
      isDirty: true,
      save: sinon.stub().resolves(val1),
    }),
    dirtyFailObj = TestUtils.mockModel(3, Constants.MODEL.ORG, {
      isDirty: true,
      save: sinon.stub().rejects(val2),
    });

  this.loadingSlider.setProperties({ startLoading: sinon.spy(), endLoading: sinon.spy() });
  this.requestService.setProperties({ handleIfError: sinon.stub().returnsArg(0) });

  service
    .persist(nonDirtyObj, then1, then2)
    .then(retVal => {
      assert.equal(retVal, nonDirtyObj);
      assert.ok(this.loadingSlider.startLoading.notCalled);
      assert.ok(this.loadingSlider.endLoading.notCalled);
      assert.ok(then1.calledOnce);
      assert.ok(then2.calledOnce);

      return service.persist([nonDirtyObj, dirtySuccessObj, dirtySuccessObj], then1, then2);
    })
    .then(retVal => {
      assert.deepEqual(retVal, [val1]);
      assert.ok(this.loadingSlider.startLoading.calledOnce);
      assert.ok(this.loadingSlider.endLoading.calledOnce);
      assert.ok(then1.calledTwice);
      assert.ok(then2.calledTwice);

      return service.persist([dirtySuccessObj, dirtyFailObj], then1, then2);
    })
    .catch(retVal => {
      assert.ok(this.loadingSlider.startLoading.calledTwice);
      assert.ok(this.loadingSlider.endLoading.calledTwice);
      assert.ok(then1.calledTwice);
      assert.ok(then2.calledTwice);

      assert.deepEqual(retVal, val2, 'returns the first error encountered');

      done();
    });
});

test('clearing an attribute list', function(assert) {
  const service = this.subject(),
    then1 = sinon.spy(),
    then2 = sinon.spy(),
    obj1 = TestUtils.mockModel(1, Constants.MODEL.ORG, { isAList: ['hi'], notAList: 'world' });

  service.clearList([null, obj1], 'notAList', then1, then2);
  assert.equal(obj1.get('notAList'), 'world', 'nothing happens if not a list');
  assert.ok(then1.calledOnce);
  assert.ok(then2.calledOnce);

  service.clearList(obj1, 'isAList', then1, then2);
  assert.deepEqual(obj1.get('isAList'), []);
  assert.ok(then1.calledTwice);
  assert.ok(then2.calledTwice);
});

test('rolling back', function(assert) {
  const service = this.subject(),
    then1 = sinon.spy(),
    then2 = sinon.spy(),
    obj1 = TestUtils.mockModel(1, Constants.MODEL.ORG, { rollbackAttributes: sinon.spy() });

  service.revert([null, obj1], then1, then2);
  assert.ok(obj1.rollbackAttributes.calledOnce);
  assert.ok(then1.calledOnce);
  assert.ok(then2.calledOnce);

  service.revert(obj1, then1, then2);
  assert.ok(obj1.rollbackAttributes.calledTwice);
  assert.ok(then1.calledTwice);
  assert.ok(then2.calledTwice);
});

test('reverting a single property', function(assert) {
  const service = this.subject(),
    then1 = sinon.spy(),
    then2 = sinon.spy(),
    propName = 'prop-to-revert',
    oldVal = Math.random(),
    newVal = Math.random(),
    changedObj = { [propName]: [oldVal, newVal] },
    obj1 = TestUtils.mockModel(1, Constants.MODEL.ORG, {
      [propName]: newVal,
      changedAttributes: sinon.stub().returns(changedObj),
    });

  service.revertProperty([null, obj1], propName, then1, then2);
  assert.ok(obj1.changedAttributes.calledOnce);
  assert.equal(obj1.get(propName), oldVal);
  assert.ok(then1.calledOnce);
  assert.ok(then2.calledOnce);

  service.revertProperty(obj1, 'notexistent-prop', then1, then2);
  assert.ok(obj1.changedAttributes.calledTwice);
  assert.equal(obj1.get(propName), oldVal);
  assert.ok(then1.calledTwice);
  assert.ok(then2.calledTwice);
});
