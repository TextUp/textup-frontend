import Ember from 'ember';
import HasWormhole from 'textup-frontend/mixins/component/has-wormhole';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';

const { computed } = Ember,
  hoistedClass = 'to-be-hoisted-into-wormhole';

// see https://shipshape.io/blog/using-components-in-ember-mixin-unit-tests/
moduleForComponent('', 'Integration | Mixin | component/has wormhole', {
  integration: true,
  beforeEach() {
    this.register('component:has-wormhole-missing-test', Ember.Component.extend(HasWormhole));
    this.register(
      'component:has-wormhole-valid-test',
      Ember.Component.extend(HasWormhole, {
        _elementToWormhole: computed(function() {
          return this.$(`.${hoistedClass}`);
        })
      })
    );
  }
});

test('components extends but missing element to move to wormhole', function(assert) {
  const wormholeClass = 'wormhole-test-class';

  assert.equal(Ember.$(`.${wormholeClass}`).length, 0);

  this.setProperties({ wormholeClass });
  this.render(hbs`{{has-wormhole-missing-test wormholeClass=wormholeClass}}`);

  assert.ok(this.$('.ember-view').length);
  assert.equal(Ember.$(`.${wormholeClass}`).length, 1);
});

test('renders into wormhole and cleans up after destroying', function(assert) {
  const wormholeClass = 'wormhole-test-class';

  assert.equal(Ember.$(`.${wormholeClass}`).length, 0);

  this.setProperties({ hoistedClass, wormholeClass });
  this.render(hbs`
    {{#has-wormhole-valid-test wormholeClass=wormholeClass}}
      <span class={{hoistedClass}}></span>
    {{/has-wormhole-valid-test}}
  `);

  assert.ok(this.$('.ember-view').length);
  assert.equal(Ember.$(`.${wormholeClass}`).length, 1);
  assert.equal(Ember.$(`.${wormholeClass}`).children().length, 1);
  assert.equal(
    Ember.$(`.${wormholeClass}`)
      .children()
      .eq(0)
      .attr('class'),
    hoistedClass
  );
});
