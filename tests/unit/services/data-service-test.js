import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import ErrorUtils from 'textup-frontend/utils/error';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

const { RSVP } = Ember;

moduleFor('service:data-service', 'Unit | Service | data service', {
  needs: ['service:analytics'],
  beforeEach() {
    this.register('service:notifications', Ember.Service);
    this.register('service:loadingSlider', Ember.Service);
    this.register('service:authService', Ember.Service);
    this.register('service:router', Ember.Service);

    this.inject.service('notifications');
    this.inject.service('loadingSlider');
    this.inject.service('authService');
    this.inject.service('router');
  },
});

test('handling map error', function(assert) {
  const service = this.subject();

  this.notifications.setProperties({ error: sinon.spy() });

  service.handleMapError();

  assert.ok(this.notifications.error.calledOnce);
});

test('handling error', function(assert) {
  const service = this.subject(),
    msg1 = Math.random(),
    msg2 = Math.random();

  this.authService.setProperties({ logout: sinon.spy() });
  this.notifications.setProperties({ info: sinon.spy(), error: sinon.spy() });
  this.router.setProperties({ transitionTo: sinon.spy() });

  service.handleError(null);
  assert.ok(this.authService.logout.notCalled);
  assert.ok(this.notifications.info.notCalled);
  assert.ok(this.notifications.error.notCalled);
  assert.ok(this.router.transitionTo.notCalled);

  service.handleError({
    [ErrorUtils.ERRORS_PROP_NAME]: [
      { [ErrorUtils.STATUS_PROP_NAME]: Constants.RESPONSE_STATUS.UNAUTHORIZED },
    ],
  });
  assert.equal(this.authService.logout.callCount, 1);
  assert.equal(this.notifications.info.callCount, 1);
  assert.ok(this.notifications.error.notCalled);
  assert.ok(this.router.transitionTo.notCalled);

  service.handleError({
    [ErrorUtils.ERRORS_PROP_NAME]: [
      { [ErrorUtils.STATUS_PROP_NAME]: Constants.RESPONSE_STATUS.NOT_FOUND },
    ],
  });
  assert.equal(this.authService.logout.callCount, 1);
  assert.equal(this.notifications.info.callCount, 1);
  assert.ok(this.notifications.error.notCalled);
  assert.equal(this.router.transitionTo.callCount, 1);
  assert.ok(this.router.transitionTo.firstCall.calledWith('index'));

  service.handleError({
    [ErrorUtils.ERRORS_PROP_NAME]: [
      { [ErrorUtils.STATUS_PROP_NAME]: Constants.RESPONSE_STATUS.TIMED_OUT },
    ],
  });
  assert.equal(this.authService.logout.callCount, 1);
  assert.equal(this.notifications.info.callCount, 1);
  assert.equal(this.notifications.error.callCount, 1);
  assert.equal(this.router.transitionTo.callCount, 1);

  service.handleError({
    [ErrorUtils.ERRORS_PROP_NAME]: [
      { [ErrorUtils.MESSAGE_PROP_NAME]: msg1 },
      { [ErrorUtils.MESSAGE_PROP_NAME]: msg2 },
    ],
  });

  assert.equal(this.authService.logout.callCount, 1);
  assert.equal(this.notifications.info.callCount, 1);
  assert.equal(this.router.transitionTo.callCount, 1);
  assert.equal(this.notifications.error.callCount, 3);
  assert.ok(this.notifications.error.calledWith(msg1));
  assert.ok(this.notifications.error.calledWith(msg2));
});

test('handling wrapping request for error handling', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    val1 = Math.random(),
    val2 = Math.random();

  service.setProperties({ handleError: sinon.spy() });

  service
    .request(val1)
    .then(retVal => {
      assert.equal(retVal, val1);
      assert.ok(service.handleError.notCalled);

      return service.request(new RSVP.Promise((resolve, reject) => reject(val2)));
    })
    .catch(retVal => {
      assert.equal(retVal, val2);
      assert.equal(service.handleError.callCount, 1);
      assert.ok(service.handleError.calledWith(val2));

      done();
    });
});

test('marking models for delete', function(assert) {
  const service = this.subject(),
    newObj = Ember.Object.create({
      isNew: true,
      rollbackAttributes: sinon.spy(),
      deleteRecord: sinon.spy(),
    }),
    oldObj = Ember.Object.create({
      isNew: false,
      rollbackAttributes: sinon.spy(),
      deleteRecord: sinon.spy(),
    });

  service.markForDelete(newObj);
  assert.ok(newObj.rollbackAttributes.calledOnce);
  assert.ok(newObj.deleteRecord.notCalled);

  service.markForDelete([oldObj, newObj]);
  assert.ok(oldObj.rollbackAttributes.notCalled);
  assert.ok(oldObj.deleteRecord.calledOnce);
  assert.ok(newObj.rollbackAttributes.calledTwice);
  assert.ok(newObj.deleteRecord.notCalled);
});

test('persistig changes in models', function(assert) {
  const service = this.subject(),
    done = assert.async(),
    val1 = Math.random(),
    val2 = Math.random(),
    nonDirtyObj = Ember.Object.create({ isDirty: false }),
    dirtySuccessObj = Ember.Object.create({ isDirty: true, save: sinon.stub().resolves(val1) }),
    dirtyFailObj = Ember.Object.create({ isDirty: true, save: sinon.stub().rejects(val2) });

  this.loadingSlider.setProperties({ startLoading: sinon.spy(), endLoading: sinon.spy() });

  service
    .persist(nonDirtyObj)
    .then(retVal => {
      assert.ok(this.loadingSlider.startLoading.notCalled);
      assert.ok(this.loadingSlider.endLoading.notCalled);
      assert.equal(retVal, nonDirtyObj);

      return service.persist([nonDirtyObj, dirtySuccessObj, dirtySuccessObj]);
    })
    .then(retVal => {
      assert.ok(this.loadingSlider.startLoading.calledOnce);
      assert.ok(this.loadingSlider.endLoading.calledOnce);
      assert.deepEqual(retVal, [val1]);

      return service.persist([dirtySuccessObj, dirtyFailObj]);
    })
    .catch(retVal => {
      assert.ok(this.loadingSlider.startLoading.calledTwice);
      assert.ok(this.loadingSlider.endLoading.calledTwice);

      assert.deepEqual(retVal, val2, 'returns the first error encountered');

      done();
    });
});
