import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('audio-recorder', 'Integration | Component | audio recorder', {
  integration: true
});

// TODO start testing
test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{audio-recorder}}`);

  assert.ok(true);
  // assert.equal(this.$().text().trim(), '');

  // // Template block usage:
  // this.render(hbs`
  //   {{#audio-recorder}}
  //     template block text
  //   {{/audio-recorder}}
  // `);

  // assert.equal(this.$().text().trim(), 'template block text');
});
