import ComposeTextComponent from 'textup-frontend/components/record-actions-control/compose-text';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'record-actions-control/compose-text',
  'Integration | Component | record actions control/compose text',
  {
    integration: true
  }
);

test('inputs + rendering', function(assert) {
  this.render(hbs`{{record-actions-control/compose-text}}`);

  assert.ok(this.$('.compose-text').length, 'no inputs is valid');
  assert.ok(this.$('.photo-control__add').length, 'has add image control');

  const noOp = () => null;
  this.setProperties({
    hasMedia: true,
    placeholder: 'hi',
    contents: 'ok',
    onClearContents: noOp,
    onSend: noOp,
    onAddImage: noOp
  });

  this.render(hbs`
    {{record-actions-control/compose-text hasMedia=hasMedia
      placeholder=placeholder
      contents=contents
      onClearContents=onClearContents
      onSend=onSend
      onAddImage=onAddImage}}
  `);

  assert.ok(this.$('.compose-text').length, 'valid inputs');
  assert.ok(this.$('.photo-control__add').length, 'has add image control');

  this.setProperties({
    invalidHasMedia: 'hi',
    invalidPlaceholder: 88,
    invalidContents: [],
    invalidOnClearContents: 'hi',
    invalidOnSend: 'hi',
    invalidOnAddImage: 'hi'
  });
  assert.throws(() => {
    this.render(hbs`
      {{record-actions-control/compose-text hasMedia=invalidHasMedia
        placeholder=invalidPlaceholder
        contents=invalidContents
        onClearContents=invalidOnClearContents
        onSend=invalidOnSend
        onAddImage=invalidOnAddImage}}
    `);
  }, 'invalid props');
});

test('contents, placeholder, and clearing contents', function(assert) {
  const placeholder = `${Math.random()}`,
    onClearContents = sinon.spy(),
    done = assert.async();
  let contents;
  this.setProperties({ contents, placeholder, onClearContents });

  this.render(hbs`
    {{record-actions-control/compose-text placeholder=placeholder
      contents=contents
      onClearContents=onClearContents}}
  `);

  assert.ok(this.$('.compose-text').length, 'valid inputs');
  assert.equal(this.$('textarea').attr('placeholder'), placeholder);
  assert.notOk(this.$('textarea').val(), 'textarea is empty');
  assert.equal(
    this.$('button.compose-text__control').length,
    1,
    'only send button, clear button not shown if no contents'
  );

  contents = `${Math.random()}`;
  this.set('contents', contents);
  wait()
    .then(() => {
      assert.equal(this.$('textarea').val(), contents);
      assert.equal(
        this.$('button.compose-text__control').length,
        2,
        'now both clear and send buttons present'
      );
      assert.ok(
        this.$('button.compose-text__control:not(.action-button)').length,
        'has clear button'
      );
      assert.ok(onClearContents.notCalled);

      this.$('button.compose-text__control:not(.action-button)')
        .first()
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok(onClearContents.calledOnce);
      assert.equal(this.$('textarea').val(), contents, 'contents can only be cleared by handler');

      done();
    });
});

test('when a text is valid and can be sent', function(assert) {
  const done = assert.async();
  this.setProperties({ contents: '', hasMedia: false });

  this.render(hbs`{{record-actions-control/compose-text contents=contents hasMedia=hasMedia}}`);

  assert.ok(this.$('.compose-text').length, 'valid inputs');
  assert.ok(
    this.$('.action-button:disabled').length,
    'cannot send with neither contents nor media'
  );

  this.setProperties({ contents: '', hasMedia: true });
  wait()
    .then(() => {
      assert.notOk(this.$('.action-button:disabled').length, 'can send with only media');

      this.setProperties({ contents: 'hi', hasMedia: false });
      return wait();
    })
    .then(() => {
      assert.notOk(this.$('.action-button:disabled').length, 'can send with only contents');

      this.setProperties({ contents: 'hi', hasMedia: true });
      return wait();
    })
    .then(() => {
      assert.notOk(this.$('.action-button:disabled').length, 'can send with only both');

      done();
    });
});

test('triggering send from action button', function(assert) {
  const done = assert.async(),
    onSend = sinon.spy(),
    onTextareaBlur = sinon.spy();
  this.setProperties({ contents: 'hi', onSend });

  this.render(hbs`{{record-actions-control/compose-text contents=contents onSend=onSend}}`);

  assert.ok(this.$('.compose-text').length, 'did render');
  assert.ok(this.$('.action-button').length);

  assert.ok(this.$('.compose-text textarea').length);
  this.$('.compose-text textarea').on('blur', onTextareaBlur);

  this.$('.action-button')
    .first()
    .click();

  wait().then(() => {
    assert.ok(onSend.calledOnce);
    assert.ok(onTextareaBlur.calledOnce);

    done();
  });
});

test('send handler returns outcome', function(assert) {
  const onSend = sinon.stub(),
    randVal = Math.random(),
    obj = ComposeTextComponent.create({ onSend });
  onSend.callsFake(() => randVal);

  assert.equal(obj._onSend(), randVal, 'send handler return outcome');
  assert.ok(onSend.calledOnce);
});
