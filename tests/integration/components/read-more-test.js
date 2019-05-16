import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';

const { run } = Ember;

moduleForComponent('read-more', 'Integration | Component | read more', {
  integration: true,
});

test('inputs', function(assert) {
  this.render(hbs`{{read-more}}`);

  assert.ok(this.$('.read-more').length, 'did render');

  this.render(hbs`{{read-more showText='hi' hideText='hi'}}`);

  assert.ok(this.$('.read-more').length, 'did render');
});

test('rendering', function(assert) {
  const done = assert.async();
  this.setProperties({ showText: `${Math.random()}`, body: 'hi how are you' });

  this.render(hbs`
    {{#read-more showText=showText}}
      {{{body}}}
    {{/read-more}}
  `);

  assert.ok(this.$('.read-more').length, 'did render');
  assert.notOk(
    this.$()
      .text()
      .includes(this.get('showText')),
    'show text not shown because body is too short'
  );

  this.set('body', '<div style="height: 1000px;"></div>');
  wait().then(() => {
    assert.ok(this.$('.read-more').length, 'did render');
    assert.ok(
      this.$()
        .text()
        .includes(this.get('showText')),
      'show text IS shown because mutation observer detects that body overflows the max preview height'
    );
    done();
  });
});

test('showing and hiding', function(assert) {
  const done = assert.async();

  this.setProperties({ showText: `${Math.random()}`, hideText: `${Math.random()}` });

  this.render(hbs`
    {{#read-more showText=showText hideText=hideText}}
      <div style="height: 1000px;"></div>
    {{/read-more}}
  `);

  assert.ok(this.$('.read-more').length, 'did render');
  assert.notOk(this.$('.read-more--open').length, 'is closed');
  assert.ok(this.$('.read-more__control').length);

  const text = this.$().text(),
    originalHeight = this.$().height();

  assert.ok(text.includes(this.get('showText')));
  assert.notOk(text.includes(this.get('hideText')));

  this.$('.read-more__control')
    .first()
    .triggerHandler('click');
  let expandedHeight;
  wait().then(() => {
    expandedHeight = this.$().height();

    assert.ok(this.$('.read-more--open').length, 'is open');
    assert.ok(expandedHeight > originalHeight, 'height has expanded');
    assert.ok(this.$('.read-more__control').length);

    const text = this.$().text();
    assert.notOk(text.includes(this.get('showText')));
    assert.ok(text.includes(this.get('hideText')));

    this.$('.read-more__control')
      .first()
      .triggerHandler('click');
    run.later(() => {
      assert.notOk(this.$('.read-more--open').length, 'is closed');
      assert.ok(this.$().height() < expandedHeight, 'height has shrunk from expanded size');
      assert.ok(this.$('.read-more__control').length);

      const text = this.$().text();
      assert.ok(text.includes(this.get('showText')));
      assert.notOk(text.includes(this.get('hideText')));

      done();
    }, 1200);
  });
});
