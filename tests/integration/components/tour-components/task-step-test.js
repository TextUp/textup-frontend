import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'tour-components/task-step',
  'Integration | Component | tour components/task step',
  {
    integration: true
  }
);

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.setProperties({
    id: 'addContacts',
    complete: false,
    text: 'Task Text',
    title: 'Task Title',
    completeTask: () => null,
    stepNumber: 1
  });

  this.render(hbs`
    {{tour-components/task-step
      id=id
      complete=complete
      text=text
      title=title
      completeTask=completeTask
      stepNumber=stepNumber}}
      `);

  assert.ok(
    this.$()
      .text()
      .includes('Step 1: Task Title')
  );

  // Template block usage:
  this.render(hbs`
    {{#tour-components/task-step
      id=id
      complete=complete
      text=text
      title=title
      completeTask=completeTask
      stepNumber=stepNumber}}
      template block text
    {{/tour-components/task-step}}
  `);

  assert.ok(
    this.$()
      .text()
      .includes('template block text')
  );
});
