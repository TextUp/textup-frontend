import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import Route from '@ember/routing/route';
import Service from '@ember/service';
import Constants from 'textup-frontend/constants';
import RouteSupportsFeedbackSlideoutMixin from 'textup-frontend/mixins/route/supports-feedback-slideout';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

const customRouteName = 'route:supports-feedback-slideout-route';

moduleFor(
  'mixin:route/supports-feedback-slideout',
  'Unit | Mixin | route/supports feedback slideout',
  {
    needs: ['service:analytics'],
    beforeEach() {
      this.register('service:tutorialService', Service);
      this.inject.service('tutorialService');
      this.register(customRouteName, Route.extend(RouteSupportsFeedbackSlideoutMixin));
    },
  }
);

test('setting up controller', function(assert) {
  const route = getOwner(this).lookup(customRouteName),
    controllerObj = EmberObject.create();

  route.setupController(controllerObj);

  assert.notOk(controllerObj.get('feedbackMessage'));
});

test('opening slideout', function(assert) {
  const route = getOwner(this).lookup(customRouteName),
    feedbackMessage = Math.random(),
    routeName = Math.random() + '',
    controller = EmberObject.create({ feedbackMessage });

  route.setProperties({ routeName, controller, send: sinon.spy() });

  route.actions.startFeedbackSlideout.call(route);

  assert.equal(controller.get('feedbackMessage'), null, 'set feedback message to null');
  assert.ok(
    route.send.calledWith(
      'toggleSlideout',
      'slideouts/feedback',
      routeName,
      Constants.SLIDEOUT.OUTLET.DEFAULT
    )
  );
});

test('closing slideout', function(assert) {
  const route = getOwner(this).lookup(customRouteName),
    feedbackMessage = Math.random(),
    controller = EmberObject.create({ feedbackMessage });

  route.setProperties({ controller, send: sinon.spy() });

  route.actions.finishFeedbackSlideout.call(route);

  assert.equal(
    controller.get('feedbackMessage'),
    feedbackMessage,
    'feedback message NOT changed to allow for form to submit with all data'
  );
  assert.ok(route.send.calledWith('closeSlideout'));
});

test('restarting tour', function(assert) {
  const route = getOwner(this).lookup(customRouteName);

  route.setProperties({ send: sinon.spy() });
  this.tutorialService.setProperties({ resetTasks: sinon.spy() });

  route.actions.restartTour.call(route);

  assert.ok(route.send.calledWith('finishFeedbackSlideout'));
  assert.ok(this.tutorialService.resetTasks.calledOnce);
});
