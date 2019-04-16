import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import NotificationsService from 'ember-cli-notifications/services/notification-messages-service';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

const { run } = Ember;

let onClose, onFinishCompleteTask, resetTasks;

moduleForComponent(
  'tour-components/task-manager',
  'Integration | Component | tour components/task manager',
  {
    integration: true,
    beforeEach() {
      this.register('service:notifications', NotificationsService);

      onClose = sinon.spy();
      onFinishCompleteTask = sinon.spy();
      resetTasks = sinon.spy();
      this.register(
        'service:tutorial-service',
        Ember.Service.extend({
          tasks: [
            {
              id: 'addContact',
              title: 'Add a contact',
              text: 'You can add multiple phone numbers to a contact if needed.',
              elementsToPulse: ['#tour-openContactListButton'],
              elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-addNewContactButton']
            },
            {
              id: 'sendMessage',
              title: 'Send a message',
              text: 'Schedule future messages by clicking the + button.',
              elementsToPulse: ['#tour-openMessageButton'],
              elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openMessageButtonMobile']
            }
          ],
          onClose: onClose,
          onFinishCompleteTask: onFinishCompleteTask,
          resetTasks: resetTasks
        })
      );
      this.inject.service('tutorial-service', { as: 'tutorialService' });
    }
  }
);

test('calls the method on complete', function(assert) {
  const tutorialService = Ember.getOwner(this).lookup('service:tutorial-service');
  const doRegister = sinon.spy();
  this.setProperties({
    tutorialService,
    doRegister,
    firstIncompleteTask: tutorialService.tasks[0]
  });
  this.render(hbs`{{tour-components/task-manager
    doRegister=doRegister
    firstIncompleteTask=firstIncompleteTask
    onClose=tutorialService.onClose
    onFinishCompleteTask=tutorialService.onFinishCompleteTask
    resetTasks=tutorialService.resetTasks}}`);
  assert.ok(doRegister.calledOnce);

  Ember.$('.task-step__button--skip')
    .first()
    .click();
  assert.ok(tutorialService.onFinishCompleteTask.calledWith('addContact'));
  Ember.$('.task-manager__title__button:eq(1)')
    .first()
    .click();
  assert.ok(tutorialService.onClose.calledOnce);
});

test('renders correct step', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  const doRegister = sinon.spy(),
    onClose = sinon.spy(),
    onFinishCompleteTask = sinon.spy(),
    resetTasks = sinon.spy(),
    tasks = [
      {
        id: 'sendMessage',
        title: 'Send a message',
        text: 'Schedule future messages by clicking the + button.',
        elementsToPulse: ['#tour-openMessageButton'],
        elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openMessageButtonMobile']
      },
      {
        id: 'addContact',
        title: 'Add a contact',
        text: 'You can add multiple phone numbers to a contact if needed.',
        elementsToPulse: ['#tour-openContactListButton'],
        elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-addNewContactButton']
      }
    ],
    firstIncompleteTask = {
      id: 'addContact',
      stepNumber: 2,
      title: 'Add a contact',
      text: 'You can add multiple phone numbers to a contact if needed.',
      elementsToPulse: ['#tour-openContactListButton'],
      elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-addNewContactButton']
    };

  this.setProperties({
    doRegister,
    onClose,
    onFinishCompleteTask,
    resetTasks,
    firstIncompleteTask,
    tasks
  });

  this.render(hbs`{{tour-components/task-manager
    doRegister=doRegister
    firstIncompleteTask=firstIncompleteTask
    onClose=onClose
    onFinishCompleteTask=onFinishCompleteTask
    resetTasks=resetTasks tasks=tasks}}`);

  const taskManagerText = this.$('.task-manager__content').text();
  assert.ok(taskManagerText.includes('Add a contact'));
  assert.ok(taskManagerText.includes('Step 2'));
  assert.ok(taskManagerText.includes('You can add multiple phone numbers to a contact if needed.'));

  assert.strictEqual(this.$('.task-manager__status-dot--complete').length, 1);
  assert.strictEqual(this.$('.task-manager__status-dot--incomplete').length, 1);
  assert.strictEqual(this.$('.task-manager__status-dot').length, 2);
});

test('shouldShow works', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  const doRegister = sinon.spy(),
    onClose = sinon.spy(),
    onFinishCompleteTask = sinon.spy(),
    resetTasks = sinon.spy(),
    firstIncompleteTask = {
      id: 'addContact',
      title: 'Add a contact',
      text: 'You can add multiple phone numbers to a contact if needed.',
      elementsToPulse: ['#tour-openContactListButton'],
      elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-addNewContactButton']
    };

  this.setProperties({
    doRegister,
    onClose,
    onFinishCompleteTask,
    resetTasks,
    firstIncompleteTask,
    shouldShow: false
  });

  this.render(hbs`{{tour-components/task-manager
    doRegister=doRegister
    firstIncompleteTask=firstIncompleteTask
    onClose=onClose
    onFinishCompleteTask=onFinishCompleteTask
    resetTasks=resetTasks
    shouldShow=shouldShow}}`);

  var taskManagerShown = this.$('.task-manager__content').is(':visible');
  assert.ok(!taskManagerShown);

  this.setProperties({
    doRegister,
    onClose,
    onFinishCompleteTask,
    resetTasks,
    firstIncompleteTask,
    shouldShow: true
  });

  this.render(hbs`{{tour-components/task-manager
    doRegister=doRegister
    firstIncompleteTask=firstIncompleteTask
    onClose=onClose
    onFinishCompleteTask=onFinishCompleteTask
    resetTasks=resetTasks
    shouldShow=shouldShow}}`);

  taskManagerShown = this.$('.task-manager__content').is(':visible');
  assert.ok(taskManagerShown);
});

test('onClose is called', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  assert.ok(true);
  const doRegister = sinon.spy(),
    onClose = sinon.spy(),
    onFinishCompleteTask = sinon.spy(),
    resetTasks = sinon.spy(),
    firstIncompleteTask = {
      id: 'addContact',
      title: 'Add a contact',
      text: 'You can add multiple phone numbers to a contact if needed.',
      elementsToPulse: ['#tour-openContactListButton'],
      elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-addNewContactButton']
    };

  this.setProperties({
    doRegister,
    onClose,
    onFinishCompleteTask,
    resetTasks,
    firstIncompleteTask
  });

  this.render(hbs`{{tour-components/task-manager
    doRegister=doRegister
    firstIncompleteTask=firstIncompleteTask
    onClose=onClose
    onFinishCompleteTask=onFinishCompleteTask
    resetTasks=resetTasks}}`);

  assert.ok(doRegister.calledOnce);
  const publicAPI = doRegister.firstCall.args[0];
  run(() => {
    publicAPI.actions.finishCompleteTask();
  });
  assert.ok(onFinishCompleteTask.calledOnce, 'finish complete task is called');
});
