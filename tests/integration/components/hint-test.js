import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tour-components/hint', 'Integration | Component | tour components/hint', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  // this.render(hbs`{{hint}}`);
  //
  // assert.equal(
  //   this.$()
  //     .text()
  //     .trim(),
  //   ''
  // );

  // Template block usage:
  this.setProperties({
    hintId: 'testHint1',
    type: 'dot'
  });
  this.render(hbs`
    {{#tour-components/hint hintId=hintId type=type}}
      template block text
    {{/tour-components/hint}}
  `);

  assert.ok(
    this.$()
      .text()
      .includes('template block text')
  );
});
