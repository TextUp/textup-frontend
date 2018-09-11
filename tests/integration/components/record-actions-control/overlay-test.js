import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'record-actions-control/overlay',
  'Integration | Component | record actions control/overlay',
  {
    integration: true
  }
);

test('valid inputs', function(assert) {
  this.render(hbs`{{record-actions-control/overlay}}`);

  assert.ok(this.$('.record-actions-control__overlay').length, 'no options is ok');

  this.setProperties({
    show: true,
    onClose: () => null,
    closeButtonLabel: 'hi',
    showCloseButton: true
  });
  this.render(hbs`
    {{record-actions-control/overlay show=show
      onClose=onClose
      closeButtonLabel=closeButtonLabel
      showCloseButton=showCloseButton}}
  `);

  assert.ok(this.$('.record-actions-control__overlay').length, 'all valid props');
});

test('invalid inputs', function(assert) {
  const noOp = () => null;

  this.setProperties({ show: 88, onClose: noOp, closeButtonLabel: 'hi', showCloseButton: true });

  this.setProperties({ invalidShow: 'ok' });
  assert.throws(
    () =>
      this.render(hbs`
        {{record-actions-control/overlay show=invalidShow
          onClose=onClose
          closeButtonLabel=closeButtonLabel
          showCloseButton=showCloseButton}}
      `),
    'show is invalid'
  );

  this.setProperties({ invalidCloseButton: 'ok' });
  assert.throws(
    () =>
      this.render(hbs`
        {{record-actions-control/overlay show=show
          onClose=invalidCloseButton
          closeButtonLabel=closeButtonLabel
          showCloseButton=showCloseButton}}
      `),
    'onClose is invalid'
  );

  this.setProperties({ invalidCloseButtonLabel: [] });
  assert.throws(
    () =>
      this.render(hbs`
        {{record-actions-control/overlay show=show
          onClose=onClose
          closeButtonLabel=invalidCloseButtonLabel
          showCloseButton=showCloseButton}}
      `),
    'closeButtonLabel is invalid'
  );

  this.setProperties({ invalidShowCloseButton: [] });
  assert.throws(
    () =>
      this.render(hbs`
        {{record-actions-control/overlay show=show
          onClose=onClose
          closeButtonLabel=closeButtonLabel
          showCloseButton=invalidShowCloseButton}}
      `),
    'showCloseButton is invalid'
  );
});

test('rendering', function(assert) {
  const closeButtonLabel = `${Math.random()}`,
    blockText = `${Math.random()}`;
  this.setProperties({ closeButtonLabel, blockText });

  this.render(hbs`{{record-actions-control/overlay closeButtonLabel=closeButtonLabel}}`);

  assert.ok(this.$('.record-actions-control__overlay').length, 'did render');
  assert.ok(this.$('.record-actions-control__overlay button').length);
  let text = this.$().text();
  assert.ok(text.includes(closeButtonLabel));
  assert.notOk(text.includes(blockText));

  this.render(hbs`
    {{#record-actions-control/overlay closeButtonLabel=closeButtonLabel}}
      {{blockText}}
    {{/record-actions-control/overlay}}
  `);

  assert.ok(this.$('.record-actions-control__overlay').length, 'did render');
  assert.ok(this.$('.record-actions-control__overlay button').length);
  text = this.$().text();
  assert.ok(text.includes(closeButtonLabel));
  assert.ok(text.includes(blockText));
});

test('toggle close button display', function(assert) {
  this.setProperties({ showCloseButton: true });

  this.render(hbs`{{record-actions-control/overlay showCloseButton=showCloseButton}}`);

  assert.ok(this.$('.record-actions-control__overlay').length, 'did render');
  assert.ok(this.$('.record-actions-control__overlay button').length, 'button is visible');

  this.set('showCloseButton', false);

  assert.notOk(this.$('.record-actions-control__overlay button').length, 'button is hidden');
});

test('opening', function(assert) {
  const done = assert.async();

  this.render(hbs`{{record-actions-control/overlay show=true}}`);

  assert.ok(this.$('.record-actions-control__overlay').length, 'did render');
  assert.ok(this.$('.record-actions-control__overlay--open').length, 'is open');

  this.set('show', false);
  this.render(hbs`{{record-actions-control/overlay show=show}}`);

  assert.ok(this.$('.record-actions-control__overlay').length, 'did render');
  assert.notOk(this.$('.record-actions-control__overlay--open').length, 'NOT open');

  this.set('show', true);
  wait().then(() => {
    assert.ok(this.$('.record-actions-control__overlay--open').length, 'is open');

    done();
  });
});

test('closing via input flag', function(assert) {
  const onClose = sinon.spy(),
    done = assert.async();

  this.setProperties({ show: true, onClose });
  this.render(hbs`{{record-actions-control/overlay show=show onClose=onClose}}`);

  assert.ok(this.$('.record-actions-control__overlay').length, 'did render');
  assert.ok(this.$('.record-actions-control__overlay--open').length, 'is open');

  this.set('show', false);
  wait().then(() => {
    assert.ok(onClose.notCalled, 'call handler only closed when the close button is pressed');
    assert.notOk(this.$('.record-actions-control__overlay--open').length, 'NOT open');

    done();
  });
});

test('closing via button click', function(assert) {
  const onClose = sinon.spy(),
    done = assert.async();

  this.setProperties({ onClose });
  this.render(hbs`{{record-actions-control/overlay show=true onClose=onClose}}`);

  assert.ok(this.$('.record-actions-control__overlay').length, 'did render');
  assert.ok(this.$('.record-actions-control__overlay--open').length, 'is open');
  assert.ok(this.$('.record-actions-control__overlay button').length, 'has button');

  this.$('.record-actions-control__overlay button')
    .first()
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(onClose.calledOnce);
    assert.ok(
      this.$('.record-actions-control__overlay--open').length,
      'still open because need to set `show` flag to false to close in the handler'
    );

    done();
  });
});
