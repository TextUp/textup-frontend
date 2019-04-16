import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import NotificationsService from 'ember-cli-notifications/services/notification-messages-service';
import hbs from 'htmlbars-inline-precompile';
import * as HintUtil from 'textup-frontend/utils/hint-info';
import sinon from 'sinon';

moduleForComponent('tour-components/hint', 'Integration | Component | tour components/hint', {
  integration: true,
  beforeEach() {
    this.register('service:notifications', NotificationsService);
  }
});

test('it renders', function(assert) {
  const getMessage = sinon.stub(HintUtil, 'getMessage');
  const getTitle = sinon.stub(HintUtil, 'getTitle');

  this.register(
    'service:tutorial-service',
    Ember.Service.extend({
      publicAPI: {
        shouldShowTaskManager: true
      }
    })
  );
  // Template block usage:
  this.setProperties({
    hintId: 'testHint1'
  });
  getMessage.returns('hint message');
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
  const getMessage = sinon.stub(HintUtil, 'getMessage');
  const getTitle = sinon.stub(HintUtil, 'getTitle');

  this.register(
    'service:tutorial-service',
    Ember.Service.extend({
      publicAPI: {
        shouldShowTaskManager: true
      }
    })
  );
  // Template block usage:
  this.setProperties({
    hintId: 'testHint1'
  });
  getMessage.returns('hint message');
  getTitle.returns('hint title');
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
  const getMessage = sinon.stub(HintUtil, 'getMessage');
  const getTitle = sinon.stub(HintUtil, 'getTitle');

  this.register(
    'service:tutorial-service',
    Ember.Service.extend({
      publicAPI: {
        shouldShowTaskManager: false
      }
    })
  );
  // Template block usage:
  this.setProperties({
    hintId: 'testHint1'
  });
  getMessage.returns('hint message');
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
