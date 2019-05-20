import $ from 'jquery';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'tour-components/task-manager',
  'Integration | Component | tour components/task manager',
  {
    integration: true,
  }
);

test('calls the method on complete', function(assert) {
  const doRegister = sinon.spy(),
    onClose = sinon.spy(),
    onFinishCompleteTask = sinon.spy(),
    firstIncompleteTask = {
      id: 'addContact',
      stepNumber: 0,
      title: 'Add a contact',
      text: 'You can add multiple phone numbers to a contact if needed.',
      elementsToPulse: ['#tour-openNewContactButton'],
      elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-addNewContactButton'],
    };
  this.setProperties({ doRegister, onClose, onFinishCompleteTask, firstIncompleteTask });

  this.render(hbs`
    {{tour-components/task-manager
      doRegister=doRegister
      firstIncompleteTask=firstIncompleteTask
      onClose=onClose
      onFinishCompleteTask=onFinishCompleteTask}}
  `);
  assert.ok(doRegister.calledOnce);

  $('.task-step__button--skip')
    .first()
    .click();
  assert.ok(onFinishCompleteTask.calledWith('addContact'));
  $('.task-manager__title__button:eq(1)')
    .first()
    .click();
  assert.ok(onClose.calledOnce);
});

test('renders correct step', function(assert) {
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
        elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openMessageButtonMobile'],
      },
      {
        id: 'addContact',
        title: 'Add a contact',
        text: 'You can add multiple phone numbers to a contact if needed.',
        elementsToPulse: ['#tour-openNewContactButton'],
        elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-addNewContactButton'],
      },
    ],
    firstIncompleteTask = {
      id: 'addContact',
      stepNumber: 2,
      title: 'Add a contact',
      text: 'You can add multiple phone numbers to a contact if needed.',
      elementsToPulse: ['#tour-openNewContactButton'],
      elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-addNewContactButton'],
    };

  this.setProperties({
    doRegister,
    onClose,
    onFinishCompleteTask,
    resetTasks,
    firstIncompleteTask,
    tasks,
  });

  this.render(hbs`
    {{tour-components/task-manager
      doRegister=doRegister
      firstIncompleteTask=firstIncompleteTask
      onClose=onClose
      onFinishCompleteTask=onFinishCompleteTask
      resetTasks=resetTasks tasks=tasks}}
  `);

  const taskManagerText = this.$('.task-manager__content').text();
  assert.ok(taskManagerText.includes('Add a contact'));
  assert.ok(taskManagerText.includes('Step 2'));
  assert.ok(taskManagerText.includes('You can add multiple phone numbers to a contact if needed.'));

  assert.strictEqual(this.$('.task-manager__status-dot--complete').length, 1);
  assert.strictEqual(this.$('.task-manager__status-dot--incomplete').length, 1);
  assert.strictEqual(this.$('.task-manager__status-dot').length, 2);
});

test('shouldShow works', function(assert) {
  const doRegister = sinon.spy(),
    onClose = sinon.spy(),
    onFinishCompleteTask = sinon.spy(),
    resetTasks = sinon.spy(),
    firstIncompleteTask = {
      id: 'addContact',
      stepNumber: 0,
      title: 'Add a contact',
      text: 'You can add multiple phone numbers to a contact if needed.',
      elementsToPulse: ['#tour-openNewContactButton'],
      elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-addNewContactButton'],
    };

  this.setProperties({
    doRegister,
    onClose,
    onFinishCompleteTask,
    resetTasks,
    firstIncompleteTask,
    shouldShow: false,
  });
  this.render(hbs`
    {{tour-components/task-manager
      doRegister=doRegister
      firstIncompleteTask=firstIncompleteTask
      onClose=onClose
      onFinishCompleteTask=onFinishCompleteTask
      resetTasks=resetTasks
      shouldShow=shouldShow}}
  `);
  assert.notOk(this.$('.task-manager__content').is(':visible'));

  this.setProperties({
    doRegister,
    onClose,
    onFinishCompleteTask,
    resetTasks,
    firstIncompleteTask,
    shouldShow: true,
  });
  this.render(hbs`{{tour-components/task-manager
    doRegister=doRegister
    firstIncompleteTask=firstIncompleteTask
    onClose=onClose
    onFinishCompleteTask=onFinishCompleteTask
    resetTasks=resetTasks
    shouldShow=shouldShow}}`);
  assert.ok(this.$('.task-manager__content').is(':visible'));
});

test('onClose is called', function(assert) {
  assert.ok(true);
  const doRegister = sinon.spy(),
    onClose = sinon.spy(),
    onFinishCompleteTask = sinon.spy(),
    resetTasks = sinon.spy(),
    firstIncompleteTask = {
      id: 'addContact',
      stepNumber: 0,
      title: 'Add a contact',
      text: 'You can add multiple phone numbers to a contact if needed.',
      elementsToPulse: ['#tour-openNewContactButton'],
      elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-addNewContactButton'],
    };

  this.setProperties({
    doRegister,
    onClose,
    onFinishCompleteTask,
    resetTasks,
    firstIncompleteTask,
  });

  this.render(hbs`
    {{tour-components/task-manager
      doRegister=doRegister
      firstIncompleteTask=firstIncompleteTask
      onClose=onClose
      onFinishCompleteTask=onFinishCompleteTask
      resetTasks=resetTasks}}
    `);

  assert.ok(doRegister.calledOnce);

  doRegister.firstCall.args[0].actions.finishCompleteTask();
  assert.ok(onFinishCompleteTask.calledOnce, 'finish complete task is called');
});
