import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'tour-components/task-manager',
  'Integration | Component | tour components/task manager',
  {
    integration: true
  }
);

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{tour-components/task-manager}}`);

  assert.ok(
    this.$()
      .text()
      .includes('Step')
  );
});
