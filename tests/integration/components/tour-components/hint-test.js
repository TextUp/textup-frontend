import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import HintUtils from 'textup-frontend/utils/hint-info';
import sinon from 'sinon';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('tour-components/hint', 'Integration | Component | tour components/hint', {
  integration: true,
  beforeEach() {
    this.register('service:tutorialService', Ember.Service);
    this.inject.service('tutorialService');
  },
});

test('it renders', function(assert) {
  const getMessage = sinon.stub(HintUtils, 'getMessage'),
    getTitle = sinon.stub(HintUtils, 'getTitle');

  this.tutorialService.setProperties({ shouldShowTaskManager: true });
  getMessage.returns('hint message');

  this.setProperties({ hintId: 'testHint1' });
  this.render(hbs`
    {{#tour-components/hint hintId=hintId}}
      template block text
    {{/tour-components/hint}}
  `);

  assert.ok(
    this.$()
      .text()
      .includes('template block text', 'content was yielded')
  );

  assert.ok(
    this.$()
      .text()
      .includes('hint message'),
    'hint text renders'
  );

  getMessage.restore();
  getTitle.restore();
});

test('title renders when is present', function(assert) {
  const getMessage = sinon.stub(HintUtils, 'getMessage'),
    getTitle = sinon.stub(HintUtils, 'getTitle');

  this.tutorialService.setProperties({ shouldShowTaskManager: true });
  getMessage.returns('hint message');
  getTitle.returns('hint title');

  this.setProperties({ hintId: 'testHint1' });
  this.render(hbs`
    {{#tour-components/hint hintId=hintId}}
      template block text
    {{/tour-components/hint}}
  `);

  assert.ok(
    this.$()
      .text()
      .includes('template block text', 'content was yielded')
  );

  assert.ok(
    this.$()
      .text()
      .includes('hint title'),
    'hint title renders'
  );

  assert.ok(
    this.$()
      .text()
      .includes('hint message'),
    'hint text renders'
  );

  getMessage.restore();
  getTitle.restore();
});

test('no show when shouldShowTaskManager is false', function(assert) {
  const getMessage = sinon.stub(HintUtils, 'getMessage'),
    getTitle = sinon.stub(HintUtils, 'getTitle');

  this.tutorialService.setProperties({ shouldShowTaskManager: false });
  getMessage.returns('hint message');

  this.setProperties({ hintId: 'testHint1' });
  this.render(hbs`
    {{#tour-components/hint hintId=hintId}}
      template block text
    {{/tour-components/hint}}
  `);

  assert.ok(
    this.$()
      .text()
      .includes('template block text', 'content was yielded')
  );

  assert.ok(
    !this.$()
      .text()
      .includes('hint message'),
    'hint text renders'
  );

  getMessage.restore();
  getTitle.restore();
});
