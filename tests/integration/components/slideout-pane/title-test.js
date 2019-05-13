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
  assert.notOk(
    this.$('.slideout-pane__header .slideout-pane__header__link').length,
    'no link rendered because no link info provided'
  );

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
  assert.ok(
    this.$('.slideout-pane__header .slideout-pane__header__control').length,
    'has close button'
  );
  assert.ok(onClose.notCalled);

  this.$('.slideout-pane__header button:not(.slideout-pane__header__link)')
    .eq(0)
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(onClose.calledOnce);

    done();
  });
});

test('rendering link + trigger link action', function(assert) {
  const onClose = sinon.spy(),
    title = Math.random() + '',
    linkLabel = Math.random() + '',
    onClickLink = sinon.spy(),
    done = assert.async();
  this.setProperties({ onClose, title, linkLabel, onClickLink });

  this.render(hbs`
    {{slideout-pane/title onClose=onClose
      title=title
      linkLabel=linkLabel
      onClickLink=onClickLink}}
  `);
  assert.ok(this.$('.slideout-pane__header').length, 'did render');
  assert.ok(this.$('.slideout-pane__header .slideout-pane__header__link').length, 'has link');

  assert.ok(
    this.$('.slideout-pane__header .slideout-pane__header__link')
      .text()
      .includes(linkLabel),
    'link has appropriate text'
  );

  this.$('.slideout-pane__header .slideout-pane__header__link').triggerHandler('click');
  wait().then(() => {
    assert.ok(onClose.notCalled);
    assert.ok(onClickLink.calledOnce);

    done();
  });
});
