import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('slideout-pane/title', 'Integration | Component | slideout pane/title', {
  integration: true,
});

test('inputs', function(assert) {
  this.setProperties({ onClose: sinon.spy() });

  this.render(hbs`{{slideout-pane/title onClose=onClose title="hi"}}`);
  assert.ok(this.$('.slideout-pane__header'.length), 'did render');

  assert.throws(() => this.render(hbs`{{slideout-pane/title}}`));
});

test('rendering title', function(assert) {
  const onClose = sinon.spy(),
    title = Math.random() + '';
  this.setProperties({ onClose, title });

  this.render(hbs`{{slideout-pane/title onClose=onClose title=title}}`);
  assert.ok(this.$('.slideout-pane__header').length, 'did render');

  assert.ok(
    this.$()
      .text()
      .indexOf(title) > -1,
    'has title'
  );
});

test('triggering close', function(assert) {
  const onClose = sinon.spy(),
    title = Math.random() + '',
    done = assert.async();
  this.setProperties({ onClose, title });

  this.render(hbs`{{slideout-pane/title onClose=onClose title=title}}`);
  assert.ok(this.$('.slideout-pane__header').length, 'did render');
  assert.ok(this.$('.slideout-pane__header button').length, 'has button');
  assert.ok(onClose.notCalled);

  this.$('.slideout-pane__header button')
    .eq(0)
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(onClose.calledOnce);

    done();
  });
});
