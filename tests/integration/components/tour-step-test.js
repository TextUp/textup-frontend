import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'tour-components/tour-step',
  'Integration | Component | tour components/tour step',
  {
    integration: true
  }
);

test('inputs', function(assert) {
  this.setProperties({
    stepId: 'washRice',
    registerWithTourManager: () => null
  });
  this.render(hbs`
    {{tour-components/tour-step
      stepId=stepId
      registerWithTourManager=registerWithTourManager}}
  `);
  assert.strictEqual(this.$('div').length, 0, 'did render without block');

  this.render(hbs`
    {{#tour-components/tour-step
      stepId=stepId
      registerWithTourManager=registerWithTourManager}}
      <div>Content</div>
    {{/tour-components/tour-step}}
  `);
  assert.ok(this.$('<div>Content</div>').length, 'Content did render');
});

test('missing inputs', function(assert) {
  this.setProperties({
    stepId: 'testStepId',
    registerWithTourManager: () => null
  });
  assert.throws(() => this.render(hbs`{{tour-components/tour-step}}`), 'missing func and hint');
  assert.throws(
    () => this.render(hbs`{{tour-components/tour-step stepId=stepId}}`),
    'missing func'
  );
  assert.throws(
    () =>
      this.render(
        hbs`{{tour-components/tour-step registerWithTourManager=registerWithTourManager}}`
      ),
    'missing step id'
  );
});

test('registerWithTourManager is called', function(assert) {
  const registerWithTourManager = sinon.spy(),
    done = assert.async();
  this.setProperties({
    stepId: 'washRice',
    registerWithTourManager: registerWithTourManager
  });
  this.render(hbs`
    {{tour-components/tour-step
      stepId=stepId
      registerWithTourManager=registerWithTourManager}}
  `);
  wait().then(() => {
    assert.ok(registerWithTourManager.calledOnce, 'registerWithTourManager called without block');
    done();
  });
});

test('registerWithTourManager is called', function(assert) {
  const registerWithTourManager = sinon.spy(),
    done = assert.async();
  this.setProperties({
    stepId: 'washRice',
    registerWithTourManager: registerWithTourManager
  });
  this.render(hbs`
    {{#tour-components/tour-step
      stepId=stepId
      registerWithTourManager=registerWithTourManager}}
      <div>Content</div>
    {{/tour-components/tour-step}}
  `);
  wait().then(() => {
    assert.ok(registerWithTourManager.calledOnce, 'registerWithTourManager called with block');
    done();
  });
});
