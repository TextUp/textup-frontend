import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'tour-components/hint-drawer',
  'Integration | Component | tour components/hint drawer',
  {
    integration: true
  }
);

test('inputs', function(assert) {
  this.setProperties({
    hintTitle: 'Hint Title',
    hintText: 'Hint Text',
    closeWindowFunction: () => null
  });
  this.render(hbs`
    {{tour-components/hint-drawer
      hintTitle=hintTitle
      hintText=hintText
      closeWindowFunction=closeWindowFunction}}
  `);
  assert.ok(this.$('.hint__drawer__body').length, 'did render');
});

test('missing inputs', function(assert) {
  this.setProperties({
    hintTitle: 'Hint Title',
    hintText: 'Hint Text',
    closeWindowFunction: () => null
  });
  assert.throws(
    () => this.render(hbs`{{tour-components/hint-drawer}}`),
    'missing func, hint title and text'
  );
  assert.throws(
    () => this.render(hbs`{{tour-components/hint-drawer hintTitle=hintTitle hintText=hintText}}`),
    'missing func'
  );
  assert.throws(
    () => this.render(hbs`{{tour-components/hint-drawer closeWindowFunction=closeWindowFunction}}`),
    'missing hint info'
  );
});

test('rendering', function(assert) {
  this.setProperties({
    hintTitle: 'Hint Title',
    hintText: 'Hint Text',
    closeWindowFunction: () => null
  });
  this.render(hbs`
    {{tour-components/hint-drawer
      hintTitle=hintTitle
      hintText=hintText
      closeWindowFunction=closeWindowFunction}}
  `);
  assert.ok(this.$('.hint__drawer__body').length, 'main body did render');
  assert.ok(this.$('.hint__drawer__body__hint-title').length, 'title did render');
  assert.ok(this.$('.hint__drawer__body__hint-text').length, 'hint did render');
  assert.ok(this.$('.hint__drawer__body__close-button').length, 'close button did render');
});

test('title and hint text', function(assert) {
  this.setProperties({
    hintTitle: 'Hint Title',
    hintText: 'Hint Text',
    closeWindowFunction: () => null
  });
  this.render(hbs`
    {{tour-components/hint-drawer
      hintTitle=hintTitle
      hintText=hintText
      closeWindowFunction=closeWindowFunction}}
  `);
  let text = this.$('.hint__drawer__body').text();
  assert.ok(text.includes('Hint Title'));
  assert.ok(text.includes('Hint Text'));
});

test('closing', function(assert) {
  const closeWindowFunction = sinon.spy(),
    done = assert.async();
  this.setProperties({
    hintTitle: 'Hint Title',
    hintText: 'Hint Text',
    closeWindowFunction: closeWindowFunction
  });
  this.render(hbs`
    {{tour-components/hint-drawer
      hintTitle=hintTitle
      hintText=hintText
      closeWindowFunction=closeWindowFunction}}
  `);
  this.$('.hint__drawer__body__close-button')
    .first()
    .triggerHandler('click');
  wait().then(() => {
    assert.ok(closeWindowFunction.calledOnce, 'closeWindowFunction called');
    done();
  });
});
