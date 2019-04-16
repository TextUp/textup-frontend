import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('tour-components/overlay', 'Integration | Component | tour components/overlay', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  // Template block usage:
  const doRegister = sinon.spy(),
    done = assert.async();
  this.setProperties({
    svgClasses: 'display-l',
    doRegister: doRegister
  });

  this.render(hbs`
      {{tour-components/overlay doRegister=doRegister svgClasses=svgClasses}}
  `);

  wait().then(() => {
    assert.ok(doRegister.calledOnce, 'doRegister called without block');
    done();
  });
});
