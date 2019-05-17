import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import NotificationsService from 'ember-cli-notifications/services/notification-messages-service';
import RouteSupportsExportSlideoutMixin from 'textup-frontend/mixins/route/supports-export-slideout';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

let startCompleteTask;
moduleFor('mixin:route/supports-export-slideout', 'Unit | Mixin | route/supports export slideout', {
  needs: ['service:analytics', 'service:compose-slideout-service', 'service:record-item-service'],
  beforeEach() {
    startCompleteTask = sinon.spy();
    this.register('service:tutorial-service', Ember.Service.extend({ startCompleteTask }));
    this.register('service:notification-messages-service', NotificationsService);
    this.register(
      'route:supports-export-slideout',
      Ember.Route.extend(RouteSupportsExportSlideoutMixin)
    );
  },
});

test('initializing properties', function(assert) {
  const route = Ember.getOwner(this).lookup('route:supports-export-slideout'),
    controllerObj = Ember.Object.create();

  route._initializeProperties(controllerObj, null);

  assert.ok(controllerObj.exportStartDate instanceof Date);
  assert.ok(controllerObj.exportEndDate instanceof Date);
  assert.equal(controllerObj.exportForEntirePhone, false);
  assert.equal(controllerObj.exportAsGrouped, false);
  assert.deepEqual(controllerObj.exportRecordOwners, []);

  route._initializeProperties(controllerObj, [1, 2, 3]);

  assert.deepEqual(controllerObj.exportRecordOwners, [1, 2, 3]);
});

test('setting up controller', function(assert) {
  const route = Ember.getOwner(this).lookup('route:supports-export-slideout'),
    controllerObj = Ember.Object.create(),
    initializeStub = sinon.stub(route, '_initializeProperties');

  route.setupController(controllerObj);

  assert.ok(initializeStub.calledOnce);
  assert.ok(initializeStub.calledWith(controllerObj));

  initializeStub.restore();
});

test('searching for record owners', function(assert) {
  const route = Ember.getOwner(this).lookup('route:supports-export-slideout');
  route.set('composeSlideoutService', { doSearch: sinon.spy() });

  route.actions.exportDoSearch.call(route);

  assert.ok(route.composeSlideoutService.doSearch.calledOnce);
});

test('inserting record owner at specified index', function(assert) {
  const done = assert.async(),
    route = Ember.getOwner(this).lookup('route:supports-export-slideout'),
    randVal = Math.random();

  route.set('controller', { exportRecordOwners: [1, 2, 3] });

  route.actions.exportInsertRecordOwner.call(route, 0, randVal).then(() => {
    assert.equal(route.get('controller.exportRecordOwners.firstObject'), randVal);
    done();
  });
});

test('remove record owner from list', function(assert) {
  const route = Ember.getOwner(this).lookup('route:supports-export-slideout'),
    randVal = Math.random();

  route.set('controller', { exportRecordOwners: [1, randVal, 3] });

  route.actions.exportRemoveRecordOwner.call(route, randVal);

  assert.deepEqual(route.get('controller.exportRecordOwners'), [1, 3]);
});

test('cancelling slideout without performing any action', function(assert) {
  const route = Ember.getOwner(this).lookup('route:supports-export-slideout');

  route.set('send', sinon.spy());

  route.actions.cancelExportSlideout.call(route);

  assert.ok(route.send.calledOnce);
  assert.ok(route.send.calledWith('closeSlideout'));
});

test('opening slideout', function(assert) {
  const route = Ember.getOwner(this).lookup('route:supports-export-slideout'),
    recordOwner = Math.random();

  route.setProperties({
    _initializeProperties: sinon.spy(),
    send: sinon.spy(),
    controller: Math.random(),
    routeName: Math.random(),
  });

  route.actions.startSingleExportSlideout.call(route, recordOwner);

  assert.ok(route._initializeProperties.calledOnce);
  assert.equal(route._initializeProperties.firstCall.args[0], route.controller);
  assert.deepEqual(route._initializeProperties.firstCall.args[1], [recordOwner]);
  assert.ok(route.send.calledOnce);
  assert.equal(route.send.firstCall.args[0], 'toggleSlideout');
  assert.equal(route.send.firstCall.args[1], 'slideouts/export/single');
  assert.equal(route.send.firstCall.args[2], route.routeName);
  assert.equal(route.send.firstCall.args[3], Constants.SLIDEOUT.OUTLET.DETAIL);

  route.actions.startMultipleExportSlideout.call(route, recordOwner);

  assert.ok(route._initializeProperties.calledTwice);
  assert.equal(route._initializeProperties.secondCall.args[0], route.controller);
  assert.deepEqual(route._initializeProperties.secondCall.args[1], recordOwner);
  assert.ok(route.send.calledTwice);
  assert.equal(route.send.secondCall.args[0], 'toggleSlideout');
  assert.equal(route.send.secondCall.args[1], 'slideouts/export/multiple');
  assert.equal(route.send.secondCall.args[2], route.routeName);
  assert.equal(route.send.secondCall.args[3], Constants.SLIDEOUT.OUTLET.DEFAULT);
});

test('starting export and finishing slideout', function(assert) {
  const done = assert.async(),
    route = Ember.getOwner(this).lookup('route:supports-export-slideout');

  route.setProperties({
    recordItemService: {
      exportRecordItems: sinon.stub().resolves(),
    },
    controller: Ember.Object.create({
      exportStartDate: Math.random(),
      exportEndDate: Math.random(),
      exportAsGrouped: Math.random(),
      exportForEntirePhone: true,
      exportRecordOwners: Math.random(),
    }),
    send: sinon.spy(),
  });

  route.actions.finishExportSlideout
    .call(route)
    .then(() => {
      assert.ok(startCompleteTask.calledWith('exportMessage'));
      assert.ok(route.recordItemService.exportRecordItems.calledOnce);
      assert.ok(
        route.recordItemService.exportRecordItems.calledWith(
          route.controller.exportStartDate,
          route.controller.exportEndDate,
          route.controller.exportAsGrouped,
          []
        )
      );
      assert.ok(route.send.calledOnce);
      assert.ok(route.send.calledWith('closeSlideout'));
      assert.ok(route.send.calledImmediatelyAfter(route.recordItemService.exportRecordItems));

      route.set('controller.exportForEntirePhone', false);
      return route.actions.finishExportSlideout.call(route);
    })
    .then(() => {
      assert.ok(route.recordItemService.exportRecordItems.calledTwice);
      assert.equal(
        route.recordItemService.exportRecordItems.secondCall.args[3],
        route.controller.exportRecordOwners
      );
      assert.ok(route.send.calledTwice);
      assert.ok(route.send.secondCall.args[0], 'closeSlideout');

      done();
    });
});
