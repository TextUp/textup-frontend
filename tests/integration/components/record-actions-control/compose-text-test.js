import { getOwner } from '@ember/application';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'record-actions-control/compose-text',
  'Integration | Component | record actions control/compose text',
  {
    integration: true,
  }
);

test('inputs', function(assert) {
  this.render(hbs`{{record-actions-control/compose-text}}`);

  assert.ok(this.$('.compose-text').length, 'no inputs is valid');

  this.setProperties({ func: () => null });

  this.render(hbs`
    {{record-actions-control/compose-text numMedia=88
      placeholder="hi"
      contents="hi"
      onClearContents=func
      onSend=func}}
  `);

  assert.ok(this.$('.compose-text').length, 'valid inputs');
});

test('rendering block', function(assert) {
  const blockText = `${Math.random()}`;
  this.setProperties({ blockText });
  this.render(hbs`
    {{#record-actions-control/compose-text}}
      {{blockText}}
    {{/record-actions-control/compose-text}}
  `);

  assert.ok(this.$('.compose-text').length);
  assert.ok(
    this.$()
      .text()
      .indexOf(blockText) > -1
  );
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
  this.setProperties({ contents: '', numMedia: 0 });

  this.render(hbs`{{record-actions-control/compose-text contents=contents numMedia=numMedia}}`);

  assert.ok(this.$('.compose-text').length, 'valid inputs');
  assert.ok(
    this.$('.action-button:disabled').length,
    'cannot send with neither contents nor media'
  );

  this.setProperties({ contents: '', numMedia: 8 });
  wait()
    .then(() => {
      assert.notOk(this.$('.action-button:disabled').length, 'can send with only media');

      this.setProperties({ contents: 'hi', numMedia: 0 });
      return wait();
    })
    .then(() => {
      assert.notOk(this.$('.action-button:disabled').length, 'can send with only contents');

      this.setProperties({ contents: 'hi', numMedia: 8 });
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
    obj = getOwner(this)
      .factoryFor('component:record-actions-control/compose-text')
      .create({ onSend });
  onSend.callsFake(() => randVal);

  assert.equal(obj._onSend(), randVal, 'send handler return outcome');
  assert.ok(onSend.calledOnce);
});
