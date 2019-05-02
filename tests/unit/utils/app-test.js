import AppUtils from 'textup-frontend/utils/app';
import Ember from 'ember';
import sinon from 'sinon';
import TypeUtils from 'textup-frontend/utils/type';
import { module, test } from 'qunit';

module('Unit | Utility | app');

test('getting controller name for route with fallback to route name', function(assert) {
  const controllerName = Math.random(),
    routeName = Math.random(),
    route1 = Ember.Route.create({ controllerName }),
    route2 = Ember.Route.create({ routeName });

  assert.equal(AppUtils.controllerNameForRoute(null), '');
  assert.equal(AppUtils.controllerNameForRoute(route1), controllerName);
  assert.equal(AppUtils.controllerNameForRoute(route2), routeName);
});

// test("aborting transition", function(assert) {
//   const isTransition = sinon.stub(TypeUtils, "isTransition")

//   isTransition.restore()
// })
