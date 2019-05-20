import RSVP from 'rsvp';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('slideout-pane/actions', 'Integration | Component | slideout pane/actions', {
  integration: true,
});

test('inputs', function(assert) {
  this.setProperties({ fn: sinon.spy() });

  this.render(hbs`
    {{slideout-pane/actions onClose=fn
      showFooter=true
      onPrimary=fn
      disablePrimary=true
      primaryLabel="hi"
      primaryProgressLabel="hi"
      primaryClass="hi"
      onSecondary=fn
      hideSecondary=true
      secondaryLabel="hi"
      onMarkForDelete=fn
      showDelete=true}}
  `);
  assert.ok(this.$('.slideout-pane__footer').length, 'did render');
});

test('whether footer should be shown at all', function(assert) {
  const done = assert.async();
  this.setProperties({ showFooter: true, fn: sinon.spy() });

  this.render(hbs`
    {{slideout-pane/actions onClose=fn
      showFooter=showFooter
      onPrimary=fn
      primaryLabel="hi"
      primaryProgressLabel="hi"}}
  `);
  assert.ok(this.$('.slideout-pane__footer').length, 'did render');
  assert.notOk(this.$('.slideout-pane__footer--hidden').length, 'not hidden');

  this.set('showFooter', false);
  wait().then(() => {
    assert.ok(this.$('.slideout-pane__footer--hidden').length, 'is hidden');

    done();
  });
});

test('primary action', function(assert) {
  const onPrimary = sinon.stub(),
    primaryLabel = Math.random() + '',
    primaryProgressLabel = Math.random() + '',
    primaryClass = 'test-primary-class',
    done = assert.async();
  this.setProperties({
    fn: sinon.spy(),
    onPrimary,
    primaryLabel,
    primaryProgressLabel,
    primaryClass,
  });

  this.render(hbs`
    {{slideout-pane/actions onClose=fn
      disablePrimary=false
      onPrimary=onPrimary
      primaryLabel=primaryLabel
      primaryProgressLabel=primaryProgressLabel
      primaryClass=primaryClass}}
  `);
  assert.ok(this.$('.slideout-pane__footer').length, 'did render');
  assert.ok(this.$('.slideout-pane__footer .' + primaryClass).length, 'has primary button');
  assert.ok(onPrimary.notCalled);

  const primaryButton = this.$('.slideout-pane__footer .' + primaryClass);
  assert.notOk(primaryButton.prop('disabled'), 'not disabled');
  assert.ok(primaryButton.text().indexOf(primaryLabel) > -1, 'has default label');
  assert.notOk(
    primaryButton.text().indexOf(primaryProgressLabel) > -1,
    'does not have loading label'
  );

  let resolveFn;
  onPrimary.callsFake(() => new RSVP.Promise(resolve => (resolveFn = resolve)));
  primaryButton.eq(0).click(); // `triggerHandler` doesn't work with `async-button`
  wait()
    .then(() => {
      assert.ok(onPrimary.calledOnce);
      assert.notOk(primaryButton.text().indexOf(primaryLabel) > -1, 'does not have default label');
      assert.ok(primaryButton.text().indexOf(primaryProgressLabel) > -1, 'has loading label');
      assert.ok(resolveFn, 'has resolve function');

      resolveFn.call();
      this.set('disablePrimary', true);
      return wait();
    })
    .then(() => {
      assert.ok(primaryButton.prop('disabled'), 'is disabled');

      done();
    });
});

test('close action', function(assert) {
  const onClose = sinon.spy(),
    secondaryLabel = Math.random() + '',
    done = assert.async();
  this.setProperties({ fn: sinon.spy(), onClose, secondaryLabel, hideSecondary: true });

  this.render(hbs`
    {{slideout-pane/actions onClose=onClose
      onPrimary=fn
      primaryLabel="hi"
      primaryProgressLabel="hi"
      hideSecondary=hideSecondary
      secondaryLabel=secondaryLabel}}
  `);
  assert.ok(this.$('.slideout-pane__footer').length, 'did render');
  assert.notOk(this.$('.slideout-pane__footer__secondary').length, 'no secondary button');

  this.set('hideSecondary', false);
  wait()
    .then(() => {
      assert.ok(this.$('.slideout-pane__footer__secondary').length, 'has secondary button');
      assert.ok(onClose.notCalled);
      const secondaryButton = this.$('.slideout-pane__footer__secondary');
      assert.ok(secondaryButton.text().indexOf(secondaryLabel) > -1, 'has secondary label');

      secondaryButton.eq(0).triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok(onClose.calledOnce);

      done();
    });
});

test('if provided, secondary action overrides close action', function(assert) {
  const onClose = sinon.spy(),
    onSecondary = sinon.spy(),
    done = assert.async();
  this.setProperties({ fn: sinon.spy(), onClose, onSecondary });

  this.render(hbs`
    {{slideout-pane/actions onClose=onClose
      onPrimary=fn
      primaryLabel="hi"
      primaryProgressLabel="hi"
      onSecondary=onSecondary}}
  `);
  assert.ok(this.$('.slideout-pane__footer').length, 'did render');
  assert.ok(this.$('.slideout-pane__footer__secondary').length, 'has secondary button');
  assert.ok(onClose.notCalled);
  assert.ok(onSecondary.notCalled);

  this.$('.slideout-pane__footer__secondary')
    .eq(0)
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(onClose.notCalled);
    assert.ok(onSecondary.calledOnce);

    done();
  });
});

test('mark for delete action', function(assert) {
  const onMarkForDelete = sinon.spy(),
    done = assert.async();
  this.setProperties({ fn: sinon.spy(), onMarkForDelete, showDelete: false });

  this.render(hbs`
    {{slideout-pane/actions onClose=fn
      onPrimary=fn
      primaryLabel="hi"
      primaryProgressLabel="hi"
      onMarkForDelete=onMarkForDelete
      showDelete=showDelete}}
  `);
  assert.ok(this.$('.slideout-pane__footer').length, 'did render');
  assert.notOk(this.$('.slideout-pane__footer__delete').length, 'no delete button');

  this.set('showDelete', true);
  wait()
    .then(() => {
      assert.ok(this.$('.slideout-pane__footer__delete').length, 'has delete button');
      assert.ok(onMarkForDelete.notCalled);

      this.$('.slideout-pane__footer__delete')
        .eq(0)
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok(onMarkForDelete.calledOnce);

      done();
    });
});
